// services/tournamentScraper.js
const puppeteer = require('puppeteer');

const USSSA_SITES = {
    FL: {
        name: 'Florida',
        sites: [
            { url: 'https://flbaseball.usssa.com/events/', sport: 'baseball' },
            // { url: 'https://flfastpitch.usssa.com/events/', sport: 'fastpitch' },
        ]
    }
};

function getExternalIdFromUrl(url, organization) {
    if (organization === 'USSSA') {
        const match = url.match(/\/event\/([^/]+)/);
        return match ? `usssa-${match[1].replace(/\/$/, '')}`.substring(0, 100) : null;
    }
    return null;
}

function parseDate(dateText) {
    if (!dateText) return null;
    try {
        const date = new Date(dateText);
        if (!isNaN(date.getTime())) {
            if (date < new Date()) {
                date.setFullYear(date.getFullYear() + 1);
            }
            return date;
        }
    } catch (e) { }
    return null;
}

function isRateLimited(text, title) {
    return text.includes('rate limited') ||
        text.includes('Access denied') ||
        text.includes('Error 1015') ||
        title.includes('Access denied') ||
        title.includes('Cloudflare');
}

function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(r => setTimeout(r, delay));
}

// ============================================
// URL COLLECTION
// ============================================

async function collectUSSSAEventUrls(page, maxPages = 20, stateCodes = ['FL']) {
    const allEventUrls = new Map();

    for (const stateCode of stateCodes) {
        const stateConfig = USSSA_SITES[stateCode];
        if (!stateConfig) {
            console.log(`  Unknown state: ${stateCode}`);
            continue;
        }

        for (const site of stateConfig.sites) {
            console.log(`\n  ${stateConfig.name} ${site.sport}...`);

            let pageNum = 1;
            let consecutiveEmpty = 0;
            let rateLimited = false;

            while (pageNum <= maxPages && consecutiveEmpty < 2 && !rateLimited) {
                const pageUrl = pageNum === 1
                    ? site.url
                    : `${site.url}page/${pageNum}/`;

                console.log(`    Page ${pageNum}...`);

                try {
                    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                    await randomDelay(1000, 2000);

                    const pageContent = await page.evaluate(() => ({
                        text: document.body.innerText,
                        title: document.title
                    }));

                    if (isRateLimited(pageContent.text, pageContent.title)) {
                        console.log(`      ⚠️ Rate limited! Waiting 60 seconds...`);
                        await new Promise(r => setTimeout(r, 60000));
                        await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
                        await randomDelay(2000, 3000);

                        const retryContent = await page.evaluate(() => ({
                            text: document.body.innerText,
                            title: document.title
                        }));

                        if (isRateLimited(retryContent.text, retryContent.title)) {
                            console.log(`      ❌ Still rate limited. Skipping ${site.sport}.`);
                            rateLimited = true;
                            continue;
                        }
                    }

                    const eventUrls = await page.evaluate(() => {
                        const links = document.querySelectorAll('a[href*="/event/"]');
                        const urls = new Set();
                        links.forEach(link => {
                            if (link.href && link.href.includes('/event/') && !link.href.includes('#')) {
                                urls.add(link.href);
                            }
                        });
                        return Array.from(urls);
                    });

                    if (eventUrls.length === 0) {
                        consecutiveEmpty++;
                    } else {
                        consecutiveEmpty = 0;
                        let newCount = 0;
                        eventUrls.forEach(url => {
                            if (!allEventUrls.has(url)) {
                                allEventUrls.set(url, { state: stateCode, sport: site.sport });
                                newCount++;
                            }
                        });
                        console.log(`      Found ${eventUrls.length} links, ${newCount} new`);
                    }

                    pageNum++;
                    await randomDelay(500, 1500);

                } catch (err) {
                    console.log(`      Error: ${err.message}`);
                    consecutiveEmpty++;
                }
            }

            if (!rateLimited) {
                console.log(`    Waiting 5 seconds before next site...`);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }

    return allEventUrls;
}

// ============================================
// SINGLE EVENT SCRAPER
// ============================================

async function scrapeUSSSAEventDetails(page, url, stateCode) {
    const urlSlug = url.match(/\/event\/([^/]+)/)?.[1] || '';
    const nameFromUrl = urlSlug
        .replace(/-(\d+)$/, '')
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());

    if (!nameFromUrl) return null;

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await randomDelay(1000, 1500);

    // Scrape main event info
    const eventData = await page.evaluate(() => {
        const results = {};
        const text = document.body.innerText || '';
        const title = document.title || '';

        // Check rate limit
        if (text.includes('rate limited') || text.includes('Access denied') || text.includes('Error 1015')) {
            return { rateLimited: true };
        }

        // City from title - "Event (Year) - Panama City Beach, FL - USSSA..."
        const titleMatch = title.match(/-\s*([A-Za-z\s]+),\s*FL\s*-/i);
        results.city = titleMatch ? titleMatch[1].trim() : null;

        // Date from ._value elements
        const allValues = document.querySelectorAll('._value');
        const dateText = allValues[0]?.innerText?.trim();

        const dateMatch = dateText?.match(/(\w{3,9})\s+(\d{1,2})\s*-\s*(\w{3,9})?\s*(\d{1,2})\s+(\d{4})/i);
        if (dateMatch) {
            const [, month1, day1, month2, day2, year] = dateMatch;
            results.startDate = `${month1} ${day1}, ${year}`;
            results.endDate = `${month2 || month1} ${day2}, ${year}`;
        } else {
            // Try single date
            const singleMatch = dateText?.match(/(\w{3,9})\s+(\d{1,2}),?\s+(\d{4})/i);
            if (singleMatch) {
                const [, month, day, year] = singleMatch;
                results.startDate = `${month} ${day}, ${year}`;
                results.endDate = results.startDate;
            }
        }

        // Entry fee - look for $ pattern
        allValues.forEach(el => {
            const t = el.innerText?.trim();
            if (t?.match(/^\$[\d,]+\s*-\s*\$[\d,]+/) || t?.match(/^\$[\d,]+$/)) {
                results.entryFee = t;
            }
        });

        // Age groups - parse range like "6U - 14U"
        const ageRangeMatch = text.match(/(\d+)U\s*-\s*(\d+)U/i);
        if (ageRangeMatch) {
            const start = parseInt(ageRangeMatch[1]);
            const end = parseInt(ageRangeMatch[2]);
            results.ageGroups = [];
            for (let i = start; i <= end; i++) {
                results.ageGroups.push(`${i}U`);
            }
        } else {
            const ageMatches = text.match(/\d+U/gi) || [];
            results.ageGroups = [...new Set(ageMatches.map(a => a.toUpperCase()))].sort((a, b) => parseInt(a) - parseInt(b));
        }

        // Format
        const fl = text.toLowerCase();
        if (fl.includes('double elimination')) results.format = 'Double Elimination';
        else if (fl.includes('single elimination') || fl.includes('sing elim')) results.format = 'Single Elimination';
        else if (fl.includes('round robin')) results.format = 'Round Robin';
        else if (fl.includes('pool play') || fl.includes('pool to')) results.format = 'Pool Play';

        // Contact
        const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@usssa\.com)/i);
        results.directorEmail = emailMatch ? emailMatch[1] : null;

        const phoneMatch = text.match(/(\d{3}[.\-]\d{3}[.\-]\d{4})/);
        results.directorPhone = phoneMatch ? phoneMatch[1] : null;

        // Gate fee
        const gateMatch = text.match(/Gate Fee[:\s]*(\$[\d,]+|TBA|Free)/i);
        results.gateFee = gateMatch ? gateMatch[1] : null;

        // Stay to play
        results.stayToPlay = /stay.?to.?play/i.test(text);

        return results;
    });

    if (eventData.rateLimited) {
        return { name: nameFromUrl, rateLimited: true };
    }

    // Click Venues tab and scrape venues
    let venues = [];
    try {
        const clicked = await page.evaluate(() => {
            const tabs = document.querySelectorAll('button, a, [role="tab"]');
            for (const tab of tabs) {
                if (tab.innerText?.trim() === 'Venues' || tab.innerText?.includes('Venues')) {
                    tab.click();
                    return true;
                }
            }
            return false;
        });

        if (clicked) {
            await randomDelay(1000, 1500);
        }

        venues = await page.evaluate(() => {
            const venueList = [];
            const rows = document.querySelectorAll('tr, [class*="row"]');

            rows.forEach(row => {
                const rowText = row.innerText?.trim();

                if (rowText && rowText.match(/(?:Complex|Park|Field|Stadium|Center)/i)) {
                    const cells = row.querySelectorAll('td, [class*="cell"], [class*="col"], div');

                    let name = null;
                    let address = null;

                    cells.forEach(cell => {
                        const cellText = cell.innerText?.trim();
                        if (!cellText) return;

                        if (cellText.match(/^[A-Za-z\s\-'\.]+(?:Complex|Park|Field|Stadium|Center)$/i) && cellText.length < 60) {
                            name = cellText;
                        }
                        else if (cellText.match(/\d+.*(?:FL|Florida)/i)) {
                            address = cellText;
                        }
                    });

                    if (name && !venueList.find(v => v.name === name)) {
                        let city = null;
                        if (address) {
                            const cityMatch = address.match(/,\s*([A-Za-z\s]+),\s*FL/i);
                            city = cityMatch ? cityMatch[1].trim() : null;
                        }

                        venueList.push({ name, address, city });
                    }
                }
            });

            // Fallback
            if (venueList.length === 0) {
                document.querySelectorAll('*').forEach(el => {
                    const t = el.innerText?.trim();
                    if (t && t.length > 5 && t.length < 60) {
                        if (t.match(/^[A-Za-z\s\-'\.]+(?:Complex|Park|Field|Stadium|Center|Sportsplex)$/i)) {
                            if (!venueList.find(v => v.name === t) &&
                                !t.includes('Stadium Pkwy') &&
                                !t.includes('Melbourne')) {
                                venueList.push({ name: t, address: null, city: null });
                            }
                        }
                    }
                });
            }

            return venueList;
        });
    } catch (err) {
        // Venue scrape failed, continue without venues
    }

    return {
        name: nameFromUrl,
        startDate: parseDate(eventData.startDate),
        endDate: parseDate(eventData.endDate),
        entryFee: eventData.entryFee,
        ageGroups: eventData.ageGroups || [],
        format: eventData.format,
        directorEmail: eventData.directorEmail,
        directorPhone: eventData.directorPhone,
        city: eventData.city || venues[0]?.city,
        state: stateCode,
        stayToPlay: eventData.stayToPlay,
        gateAdmission: eventData.gateFee,
        venues: venues,
        venueName: venues[0]?.name,
        registrationUrl: url,
        sourceUrl: url,
        organization: 'USSSA',
        sport: 'baseball',
        externalId: getExternalIdFromUrl(url, 'USSSA')
    };
}

// ============================================
// VENUE HELPER
// ============================================

async function findOrCreateVenue(pool, venue, tournament) {
    // Try to find existing venue
    const venueResult = await pool.query(`
        SELECT id, name FROM venues 
        WHERE name ILIKE $1 
        OR name ILIKE $2
        LIMIT 1
    `, [`%${venue.name}%`, venue.name]);

    if (venueResult.rows[0]) {
        return venueResult.rows[0];
    }

    // Create new venue
    const slug = venue.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const citySlug = (venue.city || tournament.city || 'unknown')
        .toLowerCase()
        .replace(/\s+/g, '-');
    const id = `${slug}-${citySlug}`;

    try {
        const newVenue = await pool.query(`
            INSERT INTO venues (id, name, slug, city, state, address)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE SET
                address = COALESCE(EXCLUDED.address, venues.address)
            RETURNING id, name
        `, [
            id,
            venue.name,
            slug,
            venue.city || tournament.city || 'Unknown',
            tournament.state || 'FL',
            venue.address
        ]);

        return newVenue.rows[0];
    } catch (err) {
        // Handle duplicate slug
        if (err.message.includes('duplicate key') && err.message.includes('slug')) {
            const newSlug = `${slug}-${citySlug}`;
            const newId = `${newSlug}-venue`;

            const retryVenue = await pool.query(`
                INSERT INTO venues (id, name, slug, city, state, address)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO NOTHING
                RETURNING id, name
            `, [
                newId,
                venue.name,
                newSlug,
                venue.city || tournament.city || 'Unknown',
                tournament.state || 'FL',
                venue.address
            ]);

            return retryVenue.rows[0];
        }
        throw err;
    }
}

// ============================================
// MAIN SCRAPER
// ============================================

async function scrapeNewEvents(pool, maxPages = 20, organizations = ['USSSA'], options = {}) {
    let browser;
    const startTime = Date.now();

    const {
        states = ['FL'],
        sports = ['baseball'],
        concurrency = 1
    } = options;

    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Tournament Scraper - ${new Date().toISOString()}`);
        console.log(`Organizations: ${organizations.join(', ')}`);
        console.log(`States: ${states.join(', ')}`);
        console.log(`Sports: ${sports.join(', ')}`);
        console.log(`${'='.repeat(60)}\n`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Collect URLs
        let urlMap = new Map();
        if (organizations.includes('USSSA')) {
            console.log('--- Collecting USSSA URLs ---');
            urlMap = await collectUSSSAEventUrls(page, maxPages, states);
            console.log(`\nTotal USSSA URLs: ${urlMap.size}`);
        }

        await page.close();

        console.log(`\n${'='.repeat(40)}`);
        console.log(`Total URLs collected: ${urlMap.size}`);

        // Check which already exist in database
        const externalIds = Array.from(urlMap.keys())
            .map(url => getExternalIdFromUrl(url, 'USSSA'))
            .filter(Boolean);

        const existingResult = await pool.query(
            'SELECT external_id FROM tournaments WHERE external_id = ANY($1)',
            [externalIds]
        );

        const existingIds = new Set(existingResult.rows.map(r => r.external_id));
        console.log(`Already in database: ${existingIds.size}`);

        // Filter to new only
        const newUrlMap = new Map();
        for (const [url, meta] of urlMap) {
            const extId = getExternalIdFromUrl(url, 'USSSA');
            if (extId && !existingIds.has(extId)) {
                newUrlMap.set(url, meta);
            }
        }

        console.log(`New events to scrape: ${newUrlMap.size}`);
        console.log(`${'='.repeat(40)}\n`);

        if (newUrlMap.size === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`No new events to scrape. (${elapsed}s)`);
            await browser.close();
            return { scraped: 0, inserted: 0, skipped: existingIds.size, total: urlMap.size };
        }

        // Close browser and reopen without request interception for scraping
        await browser.close();
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        // Scrape new events
        console.log('--- Scraping Event Details ---');
        const scrapePage = await browser.newPage();
        await scrapePage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const urls = Array.from(newUrlMap.keys());
        let inserted = 0;
        let skippedNoDate = 0;
        let venuesCreated = 0;
        let venuesLinked = 0;
        let rateLimitHits = 0;

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            const { state, sport } = newUrlMap.get(url);

            try {
                console.log(`\n[${i + 1}/${urls.length}] Scraping...`);

                const tournament = await scrapeUSSSAEventDetails(scrapePage, url, state);

                if (tournament.rateLimited) {
                    console.log(`  ⚠️ Rate limited! Waiting 60 seconds...`);
                    rateLimitHits++;
                    if (rateLimitHits >= 3) {
                        console.log(`  ❌ Too many rate limits. Stopping.`);
                        break;
                    }
                    await new Promise(r => setTimeout(r, 60000));
                    i--;
                    continue;
                }

                if (!tournament.startDate) {
                    console.log(`  ⚠️ ${tournament.name} (no date - skipping)`);
                    skippedNoDate++;
                    continue;
                }

                console.log(`  ✓ ${tournament.name}`);
                console.log(`    City: ${tournament.city || 'N/A'}`);
                console.log(`    Dates: ${tournament.startDate.toLocaleDateString()} - ${tournament.endDate?.toLocaleDateString()}`);
                console.log(`    Venues: ${tournament.venues?.length || 0}`);

                // Insert tournament
                const result = await pool.query(`
                    INSERT INTO tournaments (
                        name, start_date, end_date, age_groups, entry_fee,
                        format, director_email, director_phone,
                        venue_name, city, state, stay_to_play, gate_admission,
                        registration_url, source_url, organization, sport,
                        external_id, status, scraped_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15, $16, $17, $18, 'upcoming', CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (external_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        start_date = EXCLUDED.start_date,
                        end_date = EXCLUDED.end_date,
                        age_groups = EXCLUDED.age_groups,
                        entry_fee = EXCLUDED.entry_fee,
                        venue_name = EXCLUDED.venue_name,
                        city = EXCLUDED.city,
                        state = EXCLUDED.state,
                        scraped_at = CURRENT_TIMESTAMP
                    RETURNING id
                `, [
                    tournament.name,
                    tournament.startDate,
                    tournament.endDate,
                    tournament.ageGroups,
                    tournament.entryFee,
                    tournament.format,
                    tournament.directorEmail,
                    tournament.directorPhone,
                    tournament.venueName,
                    tournament.city,
                    tournament.state,
                    tournament.stayToPlay,
                    tournament.gateAdmission,
                    tournament.registrationUrl,
                    tournament.sourceUrl,
                    tournament.organization,
                    tournament.sport,
                    tournament.externalId
                ]);

                const tournamentId = result.rows[0]?.id;
                inserted++;

                // Link venues
                // After linking venues, update the tournament with the primary venue_id
                if (tournamentId && tournament.venues && tournament.venues.length > 0) {
                    let primaryVenueId = null;

                    for (let j = 0; j < tournament.venues.length; j++) {
                        const venue = tournament.venues[j];

                        try {
                            const venueRecord = await findOrCreateVenue(pool, venue, tournament);

                            if (venueRecord) {
                                // First venue is primary
                                if (j === 0) {
                                    primaryVenueId = venueRecord.id;
                                }

                                // Link tournament to venue
                                await pool.query(`
                    INSERT INTO tournament_venues (tournament_id, venue_id, is_primary)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (tournament_id, venue_id) DO UPDATE SET
                        is_primary = EXCLUDED.is_primary
                `, [tournamentId, venueRecord.id, j === 0]);

                                venuesLinked++;
                            }
                        } catch (venueErr) {
                            console.log(`    ❌ Venue error: ${venueErr.message}`);
                        }
                    }

                    // Update tournament with primary venue_id
                    if (primaryVenueId) {
                        await pool.query(`
                            UPDATE tournaments SET venue_id = $1 WHERE id = $2
                        `, [primaryVenueId, tournamentId]);
                    }
                }

                // Delay between requests
                await randomDelay(1500, 2500);

            } catch (err) {
                console.log(`  ❌ Error: ${err.message}`);
            }
        }

        await scrapePage.close();

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`COMPLETE in ${elapsed}s`);
        console.log(`  URLs found: ${urlMap.size}`);
        console.log(`  Already in DB (skipped): ${existingIds.size}`);
        console.log(`  New scraped: ${urls.length - skippedNoDate}`);
        console.log(`  Inserted: ${inserted}`);
        console.log(`  Skipped (no date): ${skippedNoDate}`);
        console.log(`  Venues created: ${venuesCreated}`);
        console.log(`  Venue links created: ${venuesLinked}`);
        console.log(`${'='.repeat(60)}\n`);

        return {
            total: urlMap.size,
            skipped: existingIds.size,
            scraped: urls.length,
            inserted,
            skippedNoDate,
            venuesCreated,
            venuesLinked,
            elapsed: `${elapsed}s`
        };

    } catch (error) {
        console.error('Scrape error:', error.message);
        return { error: error.message };
    } finally {
        if (browser) await browser.close();
    }
}

async function updateStatuses(pool) {
    await pool.query(`
        UPDATE tournaments SET status = 'in_progress'
        WHERE start_date <= CURRENT_DATE 
          AND (end_date >= CURRENT_DATE OR end_date IS NULL)
          AND status NOT IN ('completed', 'in_progress')
    `);

    await pool.query(`
        UPDATE tournaments SET status = 'completed'
        WHERE (end_date < CURRENT_DATE OR (end_date IS NULL AND start_date < CURRENT_DATE))
          AND status != 'completed'
    `);

    await pool.query(`
        DELETE FROM tournaments 
        WHERE end_date < CURRENT_DATE - INTERVAL '60 days'
    `);
}

module.exports = {
    scrapeNewEvents,
    updateStatuses,
    getExternalIdFromUrl
};