// services/perfectGameScraper.js
const puppeteer = require('puppeteer');

// Perfect Game regional page URLs - manually configured by state
const PG_REGIONS = {
    FL: {
        name: 'Florida',
        regions: [
            { fid: 341, name: 'North Florida', sport: 'baseball' },
            { fid: 342, name: 'Central Florida', sport: 'baseball' },
            { fid: 343, name: 'South Florida', sport: 'baseball' },
        ]
    },
    // Add more states as needed
};

function getExternalIdFromUrl(url, groupId) {
    if (groupId) {
        return `pg-${groupId}`.substring(0, 100);
    }
    const match = url?.match(/gid=(\d+)/);
    return match ? `pg-${match[1]}`.substring(0, 100) : null;
}

function parseDateRange(dateText, year = 2026) {
    if (!dateText) return { startDate: null, endDate: null };

    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    // Handle formats like "Feb 13-15" or "Feb 27-Mar 1" or "Jun 27-Jul 1"
    const match = dateText.match(/(\w{3})\s+(\d{1,2})\s*-\s*(?:(\w{3})\s+)?(\d{1,2})/);
    if (!match) return { startDate: null, endDate: null };

    const startMonth = months[match[1]];
    const startDay = match[2].padStart(2, '0');
    const endMonth = match[3] ? months[match[3]] : startMonth;
    const endDay = match[4].padStart(2, '0');

    if (!startMonth || !endMonth) return { startDate: null, endDate: null };

    // Handle year rollover
    let endYear = year;
    if (parseInt(endMonth) < parseInt(startMonth)) endYear = year + 1;

    return {
        startDate: new Date(`${year}-${startMonth}-${startDay}`),
        endDate: new Date(`${endYear}-${endMonth}-${endDay}`)
    };
}

function isRateLimited(text, title) {
    return text?.includes('rate limited') ||
        text?.includes('Access denied') ||
        text?.includes('Error 1015') ||
        text?.includes('403 Forbidden') ||
        title?.includes('Access denied') ||
        title?.includes('Cloudflare');
}

function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(r => setTimeout(r, delay));
}

// Fallback venue mapping when detail page doesn't have venue info
function getVenueFallbackByCity(city) {
    if (!city) return null;

    const cityLower = city.toLowerCase().replace(/\s+/g, ' ').trim();

    if (cityLower === 'sanford') {
        return 'BOOMBAH Sports Complex';
    } else if (cityLower === 'auburndale') {
        return 'Lake Myrtle Sports Complex';
    } else if (cityLower === 'fort myers') {
        return 'Lee Health Sports Complex';
    } else if (cityLower === 'west palm beach') {
        return 'CACTI Park of the Palm Beaches';
    } else if (cityLower === 'jupiter') {
        return 'Roger Dean Stadium';
    } else if (cityLower === 'bradenton') {
        return 'IMG Academy';
    } else if (cityLower === 'gainesville' || cityLower === 'gainsville') {
        return 'Condron Family Ballpark';
    } else if (cityLower === 'orlando') {
        return 'John Euliano Park';
    } else if (cityLower === 'miami' || cityLower === 'coral gables') {
        return 'Alex Rodriguez Park';
    } else if (cityLower === 'live oak' || cityLower === 'liveoak') {
        return 'FL First Federal Sports Complex';
    }

    return null;
}

// ============================================
// PARSE TOURNAMENTS FROM REGIONAL PAGE
// ============================================

async function parseRegionalPage(page, regionInfo, stateCode) {
    const tournaments = await page.evaluate((regionName, state) => {
        const results = [];
        const seenGids = new Set();

        // Find all links to GroupedEvents pages
        const groupLinks = document.querySelectorAll('a[href*="GroupedEvents.aspx?gid="]');

        groupLinks.forEach(link => {
            const gidMatch = link.href.match(/gid=(\d+)/);
            if (!gidMatch || seenGids.has(gidMatch[1])) return;

            const groupId = gidMatch[1];
            seenGids.add(groupId);

            // Walk up to find the tournament container
            let container = link;
            for (let i = 0; i < 10; i++) {
                container = container.parentElement;
                if (!container) break;

                const text = container.innerText || '';

                // Check if this container has date info (like "Feb 13-15")
                if (text.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+/i)) {
                    // Found a container with date info

                    // Extract tournament name - look for bold text or "20XX PG" pattern
                    const boldEl = container.querySelector('b, strong');
                    let name = boldEl?.innerText?.trim();

                    // Clean name - remove asterisks
                    if (name) {
                        name = name.replace(/\*+/g, '').trim();
                    }

                    // Fallback to regex pattern
                    if (!name) {
                        const nameMatch = text.match(/(20\d{2}\s+(?:PG|BCS)[^\n]+)/);
                        if (nameMatch) name = nameMatch[1].trim();
                    }

                    if (!name) return;

                    // Extract date range
                    const dateMatch = text.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+\s*-\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+)?\d+)/i);
                    const dateRange = dateMatch ? dateMatch[1] : null;

                    // Extract team count
                    const teamsMatch = text.match(/(\d+)\s*TEAMS/i);
                    const teamCount = teamsMatch ? parseInt(teamsMatch[1]) : null;

                    // Extract city - find line that matches "City, FL" pattern
                    let city = null;
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                    for (const line of lines) {
                        // Match lines that end with ", FL" or ",FL" - more flexible pattern
                        const cityMatch = line.match(/^([A-Za-z][A-Za-z\s]*[a-z]),?\s*FL$/i) ||
                            line.match(/([A-Za-z][A-Za-z\s]+),?\s*FL\s*$/i);
                        if (cityMatch && !cityMatch[1].includes('PG') && !cityMatch[1].includes('20') && cityMatch[1].length < 30) {
                            city = cityMatch[1].trim();
                            break;
                        }
                    }

                    // Fallback: look for "City, FL" anywhere in text
                    if (!city) {
                        const fallbackMatch = text.match(/\n([A-Za-z][A-Za-z\s]{2,20}),?\s*FL[\s\n]/i);
                        if (fallbackMatch && !fallbackMatch[1].includes('PG')) {
                            city = fallbackMatch[1].trim();
                        }
                    }

                    // Only add if we have a name and haven't seen this gid
                    if (name && !results.find(r => r.groupId === groupId)) {
                        results.push({
                            groupId,
                            name,
                            dateRange,
                            teamCount,
                            city,
                            state,
                            region: regionName
                        });
                    }
                    break;
                }
            }
        });

        return results;
    }, regionInfo.name, stateCode);

    // Post-process: add computed fields
    return tournaments.map(t => {
        const dates = parseDateRange(t.dateRange);

        // Extract age groups from name if present (like "13U World Series")
        const ageGroups = [];
        const ageMatch = t.name.match(/(\d+)U/i);
        if (ageMatch) {
            ageGroups.push(ageMatch[1] + 'U');
        }

        return {
            ...t,
            venue: null, // Will be populated from fetchDetails or fallback
            ageGroups,
            startDate: dates.startDate,
            endDate: dates.endDate,
            sourceUrl: `https://www.perfectgame.org/Schedule/GroupedEvents.aspx?gid=${t.groupId}`,
            registrationUrl: `https://www.perfectgame.org/Schedule/GroupedEvents.aspx?gid=${t.groupId}`,
            organization: 'Perfect Game',
            sport: 'baseball',
            externalId: getExternalIdFromUrl(null, t.groupId)
        };
    });
}

// ============================================
// COLLECT ALL TOURNAMENTS FROM REGIONAL PAGES
// ============================================

async function collectPGTournaments(page, stateCodes = ['FL']) {
    const allTournaments = [];

    for (const stateCode of stateCodes) {
        const stateConfig = PG_REGIONS[stateCode];
        if (!stateConfig) {
            console.log(`  Unknown state: ${stateCode}`);
            continue;
        }

        console.log(`\n  ${stateConfig.name}...`);

        for (const region of stateConfig.regions) {
            const url = `https://www.perfectgame.org/Schedule/FeaturedEvents.aspx?fid=${region.fid}`;
            console.log(`\n    ${region.name} (fid=${region.fid})...`);

            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
                await randomDelay(2000, 4000);

                // Check for rate limiting
                const pageContent = await page.evaluate(() => ({
                    text: document.body?.innerText || '',
                    title: document.title || ''
                }));

                if (isRateLimited(pageContent.text, pageContent.title)) {
                    console.log(`      ⚠️ Rate limited! Waiting 60 seconds...`);
                    await new Promise(r => setTimeout(r, 60000));
                    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
                    await randomDelay(3000, 5000);
                }

                const tournaments = await parseRegionalPage(page, region, stateCode);
                console.log(`      Found ${tournaments.length} tournaments`);

                // Debug: show first tournament found
                if (tournaments.length > 0) {
                    console.log(`      First: ${tournaments[0].name} (${tournaments[0].dateRange}) - ${tournaments[0].city}`);
                }

                allTournaments.push(...tournaments);

                // Delay between regions
                await randomDelay(3000, 5000);

            } catch (err) {
                console.log(`      Error: ${err.message}`);
            }
        }
    }

    return allTournaments;
}

// ============================================
// SCRAPE ADDITIONAL EVENT DETAILS (OPTIONAL)
// ============================================

async function scrapeEventDetails(page, groupId) {
    const url = `https://www.perfectgame.org/Schedule/GroupedEvents.aspx?gid=${groupId}`;

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await randomDelay(1500, 2500);

        const details = await page.evaluate(() => {
            const text = document.body?.innerText || '';
            const results = {};

            // Venue - look for known venue patterns first
            const venuePatterns = [
                /BOOMBAH\s+Sports\s+Complex/i,
                /Lake\s+Myrtle\s+Sports\s+(?:Complex|Park)/i,
                /Lee\s+Health\s+Sports\s+Complex/i,
                /CACTI\s+Park/i,
                /Roger\s+Dean/i,
                /JetBlue\s+Park/i,
                /IMG\s+Academy/i,
                /Condron\s+Family\s+Ballpark/i,
                /John\s+Euliano\s+Park/i,
                /Alex\s+Rodriguez\s+Park/i,
                /Hammond\s+Stadium/i,
                /CoolToday\s+Park/i,
                /LECOM\s+Park/i,
                /Ed\s+Smith\s+Stadium/i,
                /Steinbrenner\s+Field/i,
                /BayCare\s+Ballpark/i,
                /TD\s+Ballpark/i,
                /Clover\s+Park/i,
                /FL\s+First\s+Federal\s+Sports\s+Complex/i,
                /First\s+Federal\s+Sports\s+Complex/i,
            ];

            for (const pattern of venuePatterns) {
                const venueMatch = text.match(pattern);
                if (venueMatch) {
                    results.venue = venueMatch[0].trim();
                    break;
                }
            }

            // If no known venue found, try generic patterns (but not "Various Parks")
            if (!results.venue) {
                const genericPatterns = [
                    /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\s+Sports\s+Complex)/,
                    /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\s+Ballpark)/,
                    /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\s+Stadium)/,
                ];
                for (const pattern of genericPatterns) {
                    const match = text.match(pattern);
                    if (match && !match[1].includes('Theme') && !match[1].includes('Water') && !match[1].includes('Various')) {
                        results.venue = match[1].trim();
                        break;
                    }
                }
            }

            // Check for "Various Parks" - means no specific venue
            if (/Various\s+Parks/i.test(text)) {
                results.variousVenues = true;
            }

            // City extraction - handle different formats
            // Format 1: "Sanford, FL" on its own line
            // Format 2: "St. Johns County Fl Region, FL" (extract county name)
            let city = null;

            // Try to find "County" patterns first (like "St. Johns County")
            const countyMatch = text.match(/([A-Z][a-z\.]+(?:\s+[A-Z][a-z]+)*)\s+County/i);
            if (countyMatch) {
                city = countyMatch[1].trim() + ' County';
            }

            // If no county, look for standard "City, FL" pattern
            if (!city) {
                const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                for (const line of lines) {
                    // Skip lines with "Region" or "Fl Region"
                    if (/Region/i.test(line)) continue;

                    const cityMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),?\s*FL$/i);
                    if (cityMatch && !cityMatch[1].includes('PG')) {
                        city = cityMatch[1].trim();
                        break;
                    }
                }
            }

            // Fallback - any "City, FL" pattern not containing "Region"
            if (!city) {
                const fallbackMatch = text.match(/\n([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*FL\s*\n/);
                if (fallbackMatch && !/Region/i.test(fallbackMatch[1])) {
                    city = fallbackMatch[1].trim();
                }
            }

            if (city) results.city = city;

            // Entry fee
            const feeMatch = text.match(/Entry\s*Fee[:\s]*\$?([\d,]+)/i) ||
                text.match(/\$\s*([\d,]+)\s*(?:per team|entry)/i);
            results.entryFee = feeMatch ? `$${feeMatch[1]}` : null;

            // Gate fee
            const gateMatch = text.match(/Gate[:\s]*\$?([\d,]+|Free|TBA)/i) ||
                text.match(/Admission[:\s]*\$?([\d,]+|Free|TBA)/i);
            results.gateFee = gateMatch ? gateMatch[1] : null;

            // Contact email
            const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@(?:perfectgame\.org|gmail\.com))/i);
            results.directorEmail = emailMatch ? emailMatch[1] : null;

            // Games guaranteed
            const gamesMatch = text.match(/(\d+)\s*(?:games?\s*)?guaranteed/i);
            results.gamesGuaranteed = gamesMatch ? parseInt(gamesMatch[1]) : null;

            // Format
            if (/double\s*elimination/i.test(text)) results.format = 'Double Elimination';
            else if (/single\s*elimination/i.test(text)) results.format = 'Single Elimination';
            else if (/pool\s*play/i.test(text)) results.format = 'Pool Play';
            else if (/round\s*robin/i.test(text)) results.format = 'Round Robin';

            // Stay to play
            results.stayToPlay = /stay.?to.?play/i.test(text);

            // Event tier
            if (/signature/i.test(text)) results.tier = 'Signature';
            else if (/premier/i.test(text)) results.tier = 'Premier';
            else if (/classic/i.test(text)) results.tier = 'Classic';
            else if (/futures/i.test(text)) results.tier = 'Futures';

            return results;
        });

        return details;

    } catch (err) {
        console.log(`      ⚠️ Details fetch failed: ${err.message.substring(0, 50)}...`);
        return {}; // Return empty so fallback venue can be applied
    }
}

// ============================================
// VENUE HELPER
// ============================================

async function findOrCreateVenue(pool, venueName, tournament) {
    if (!venueName) return null;

    // Clean venue name
    const cleanName = venueName
        .replace(/&\s*Surrounding.*$/i, '')
        .replace(/\s+/g, ' ')
        .trim();

    // Try to find existing venue
    const venueResult = await pool.query(`
        SELECT id, name FROM venues 
        WHERE name ILIKE $1 
        OR name ILIKE $2
        LIMIT 1
    `, [`%${cleanName}%`, cleanName]);

    if (venueResult.rows[0]) {
        return venueResult.rows[0];
    }

    // Create new venue
    const slug = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const citySlug = (tournament.city || 'unknown')
        .toLowerCase()
        .replace(/\s+/g, '-');
    const id = `${slug}-${citySlug}`;

    try {
        const newVenue = await pool.query(`
            INSERT INTO venues (id, name, slug, city, state)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (id) DO UPDATE SET
                name = COALESCE(EXCLUDED.name, venues.name)
            RETURNING id, name
        `, [
            id,
            cleanName,
            slug,
            tournament.city || 'Unknown',
            tournament.state || 'FL'
        ]);

        console.log(`      ✓ Created venue: ${cleanName}`);
        return newVenue.rows[0];
    } catch (err) {
        if (err.message.includes('duplicate key') && err.message.includes('slug')) {
            const newSlug = `${slug}-${citySlug}`;
            const newId = `${newSlug}-venue`;

            const retryVenue = await pool.query(`
                INSERT INTO venues (id, name, slug, city, state)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO NOTHING
                RETURNING id, name
            `, [
                newId,
                cleanName,
                newSlug,
                tournament.city || 'Unknown',
                tournament.state || 'FL'
            ]);

            return retryVenue.rows[0];
        }
        console.log(`      ❌ Venue error: ${err.message}`);
        return null;
    }
}

// ============================================
// MAIN SCRAPER
// ============================================

async function scrapeNewEvents(pool, options = {}) {
    let browser;
    const startTime = Date.now();

    const {
        states = ['FL'],
        fetchDetails = false
    } = options;

    try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Perfect Game Scraper - ${new Date().toISOString()}`);
        console.log(`States: ${states.join(', ')}`);
        console.log(`Fetch Details: ${fetchDetails}`);
        console.log(`${'='.repeat(60)}\n`);

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Collect tournaments
        console.log('--- Collecting Perfect Game Tournaments ---');
        const tournaments = await collectPGTournaments(page, states);
        console.log(`\nTotal tournaments found: ${tournaments.length}`);

        if (tournaments.length === 0) {
            console.log('\n⚠️  No tournaments found. The page structure may have changed.');
            console.log('    Run debugPGScraper.js to inspect the page.');
            await browser.close();
            return { total: 0, inserted: 0, error: 'No tournaments found' };
        }

        // Check existing
        const externalIds = tournaments.map(t => t.externalId).filter(Boolean);

        const existingResult = await pool.query(
            'SELECT external_id FROM tournaments WHERE external_id = ANY($1)',
            [externalIds]
        );

        const existingIds = new Set(existingResult.rows.map(r => r.external_id));
        console.log(`Already in database: ${existingIds.size}`);

        // Filter new
        const newTournaments = tournaments.filter(t => !existingIds.has(t.externalId));
        console.log(`New tournaments to insert: ${newTournaments.length}`);

        if (newTournaments.length === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`\nNo new tournaments to insert. (${elapsed}s)`);
            await browser.close();
            return { total: tournaments.length, inserted: 0, skipped: existingIds.size };
        }

        // Insert
        console.log('\n--- Inserting Tournaments ---');
        let inserted = 0;
        let venuesLinked = 0;
        let skippedNoDate = 0;

        for (let i = 0; i < newTournaments.length; i++) {
            const tournament = newTournaments[i];

            try {
                if (fetchDetails && tournament.groupId) {
                    const details = await scrapeEventDetails(page, tournament.groupId);

                    // Merge details - only overwrite if we got new data
                    if (details.venue) tournament.venue = details.venue;
                    if (details.city && !tournament.city) tournament.city = details.city;
                    if (details.entryFee) tournament.entryFee = details.entryFee;
                    if (details.gateFee) tournament.gateFee = details.gateFee;
                    if (details.directorEmail) tournament.directorEmail = details.directorEmail;
                    if (details.format) tournament.format = details.format;
                    if (details.stayToPlay) tournament.stayToPlay = details.stayToPlay;
                    if (details.variousVenues) tournament.variousVenues = true;

                    await randomDelay(2000, 3000);
                }

                // If no venue from details, use city-based fallback (but not for "Various Parks" events)
                if (!tournament.venue && tournament.city && !tournament.variousVenues) {
                    tournament.venue = getVenueFallbackByCity(tournament.city);
                    if (tournament.venue) {
                        console.log(`      Using fallback venue: ${tournament.venue}`);
                    }
                }

                if (!tournament.startDate) {
                    console.log(`  ⚠️ ${tournament.name} (no date - skipping)`);
                    skippedNoDate++;
                    continue;
                }

                console.log(`\n[${i + 1}/${newTournaments.length}] ${tournament.name}`);
                console.log(`    ${tournament.startDate.toLocaleDateString()} - ${tournament.endDate?.toLocaleDateString()} | ${tournament.city || 'Unknown'}, ${tournament.state}`);
                if (tournament.venue) {
                    console.log(`    Venue: ${tournament.venue}`);
                } else if (tournament.variousVenues) {
                    console.log(`    Venue: Various Parks (no specific venue)`);
                }

                const result = await pool.query(`
                    INSERT INTO tournaments (
                        name, start_date, end_date, age_groups, entry_fee,
                        format, director_email,
                        venue_name, city, state, stay_to_play, gate_admission,
                        registration_url, source_url, organization, sport,
                        external_id, status, scraped_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15, $16, $17, 'upcoming', CURRENT_TIMESTAMP
                    )
                    ON CONFLICT (external_id) DO UPDATE SET
                        name = EXCLUDED.name,
                        start_date = EXCLUDED.start_date,
                        end_date = EXCLUDED.end_date,
                        age_groups = EXCLUDED.age_groups,
                        venue_name = EXCLUDED.venue_name,
                        city = EXCLUDED.city,
                        scraped_at = CURRENT_TIMESTAMP
                    RETURNING id
                `, [
                    tournament.name,
                    tournament.startDate,
                    tournament.endDate,
                    tournament.ageGroups || [],
                    tournament.entryFee,
                    tournament.format,
                    tournament.directorEmail,
                    tournament.venue,
                    tournament.city,
                    tournament.state,
                    tournament.stayToPlay || false,
                    tournament.gateFee,
                    tournament.registrationUrl,
                    tournament.sourceUrl,
                    tournament.organization,
                    tournament.sport,
                    tournament.externalId
                ]);

                const tournamentId = result.rows[0]?.id;
                inserted++;

                // Link venue
                if (tournamentId && tournament.venue) {
                    const venueRecord = await findOrCreateVenue(pool, tournament.venue, tournament);

                    if (venueRecord) {
                        await pool.query(`
                            INSERT INTO tournament_venues (tournament_id, venue_id, is_primary)
                            VALUES ($1, $2, true)
                            ON CONFLICT (tournament_id, venue_id) DO NOTHING
                        `, [tournamentId, venueRecord.id]);

                        await pool.query(`
                            UPDATE tournaments SET venue_id = $1 WHERE id = $2
                        `, [venueRecord.id, tournamentId]);

                        venuesLinked++;
                    }
                }

            } catch (err) {
                console.log(`  ❌ Error: ${err.message}`);
            }
        }

        await page.close();

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n${'='.repeat(60)}`);
        console.log(`COMPLETE in ${elapsed}s`);
        console.log(`  Total found: ${tournaments.length}`);
        console.log(`  Already in DB: ${existingIds.size}`);
        console.log(`  Inserted: ${inserted}`);
        console.log(`  Skipped (no date): ${skippedNoDate}`);
        console.log(`  Venues linked: ${venuesLinked}`);
        console.log(`${'='.repeat(60)}\n`);

        return { total: tournaments.length, skipped: existingIds.size, inserted, venuesLinked, elapsed: `${elapsed}s` };

    } catch (error) {
        console.error('Scrape error:', error.message);
        return { error: error.message };
    } finally {
        if (browser) await browser.close();
    }
}

// ============================================
// TEST FUNCTION
// ============================================

async function testScraper() {
    let browser;

    try {
        console.log('Starting Perfect Game scraper test...\n');

        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        const tournaments = await collectPGTournaments(page, ['FL']);

        console.log('\n' + '='.repeat(60));
        console.log('RESULTS');
        console.log('='.repeat(60));
        console.log(`Total tournaments: ${tournaments.length}\n`);

        if (tournaments.length === 0) {
            console.log('⚠️  No tournaments found!');
            console.log('    The page structure may have changed.');
            console.log('    Run debugPGScraper.js for more info.\n');
            return [];
        }

        // Group by region
        const byRegion = {};
        tournaments.forEach(t => {
            const region = t.region || 'Unknown';
            if (!byRegion[region]) byRegion[region] = [];
            byRegion[region].push(t);
        });

        for (const [region, regionTournaments] of Object.entries(byRegion)) {
            console.log(`\n${region}: ${regionTournaments.length} tournaments`);
            regionTournaments.slice(0, 5).forEach(t => {
                console.log(`  - ${t.name}`);
                console.log(`    ${t.startDate?.toLocaleDateString() || 'No date'} | ${t.city}, ${t.state} | ${t.venue || 'No venue'}`);
            });
            if (regionTournaments.length > 5) {
                console.log(`  ... and ${regionTournaments.length - 5} more`);
            }
        }

        // Venues
        const venues = [...new Set(tournaments.map(t => t.venue).filter(Boolean))];
        console.log(`\nUnique venues: ${venues.length}`);
        venues.forEach(v => console.log(`  - ${v}`));

        // Sample JSON
        console.log('\nSample JSON:');
        console.log(JSON.stringify(tournaments[0], null, 2));

        await page.close();
        return tournaments;

    } catch (err) {
        console.error('Test error:', err.message);
        return [];
    } finally {
        if (browser) await browser.close();
    }
}

module.exports = {
    scrapeNewEvents,
    testScraper,
    getExternalIdFromUrl,
    getVenueFallbackByCity,
    PG_REGIONS
};

if (require.main === module) {
    testScraper().then(() => process.exit(0));
}