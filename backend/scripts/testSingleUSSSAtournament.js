require('dotenv').config();
const puppeteer = require('puppeteer');
const pool = require('../config/db');

const TEST_URL = 'https://flbaseball.usssa.com/event/easton-hype-tour-nit-battle-4-the-belts-2k26/';

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

function getExternalIdFromUrl(url) {
    const match = url.match(/\/event\/([^/]+)/);
    return match ? `usssa-${match[1].replace(/\/$/, '')}`.substring(0, 100) : null;
}

async function testSingleEvent() {
    console.log('='.repeat(60));
    console.log('Testing single event scrape');
    console.log(`URL: ${TEST_URL}`);
    console.log('='.repeat(60));

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

    try {
        // Load the event page
        console.log('\n1. Loading page...');
        await page.goto(TEST_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        // Extract event name from URL
        const urlSlug = TEST_URL.match(/\/event\/([^/]+)/)?.[1] || '';
        const nameFromUrl = urlSlug
            .replace(/-(\d+)$/, '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        console.log(`   Name from URL: ${nameFromUrl}`);

        // Scrape main event info
        console.log('\n2. Scraping main event info...');
        const eventData = await page.evaluate(() => {
            const results = {};
            const text = document.body.innerText || '';

            results.title = document.title;

            const titleMatch = results.title.match(/-\s*([A-Za-z\s]+),\s*FL\s*-/i);
            results.city = titleMatch ? titleMatch[1].trim() : null;

            const allValues = document.querySelectorAll('._value');
            results.allValueTexts = [...allValues].map(el => el.innerText?.trim());

            const dateText = allValues[0]?.innerText?.trim();
            results.rawDateText = dateText;

            const dateMatch = dateText?.match(/(\w{3,9})\s+(\d{1,2})\s*-\s*(\w{3,9})?\s*(\d{1,2})\s+(\d{4})/i);
            if (dateMatch) {
                const [, month1, day1, month2, day2, year] = dateMatch;
                results.startDate = `${month1} ${day1}, ${year}`;
                results.endDate = `${month2 || month1} ${day2}, ${year}`;
            }

            allValues.forEach(el => {
                const t = el.innerText?.trim();
                if (t?.match(/^\$[\d,]+\s*-\s*\$[\d,]+/) || t?.match(/^\$[\d,]+$/)) {
                    results.entryFee = t;
                }
            });

            const ageSection = text.match(/Age Groups?\s*[\r\n]+\s*([^\r\n]+)/i);
            results.rawAgeText = ageSection ? ageSection[1] : null;

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

            const fl = text.toLowerCase();
            if (fl.includes('double elimination')) results.format = 'Double Elimination';
            else if (fl.includes('single elimination') || fl.includes('sing elim')) results.format = 'Single Elimination';
            else if (fl.includes('round robin')) results.format = 'Round Robin';
            else if (fl.includes('pool play') || fl.includes('pool to')) results.format = 'Pool Play';

            const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@usssa\.com)/i);
            results.directorEmail = emailMatch ? emailMatch[1] : null;

            const phoneMatch = text.match(/(\d{3}[.\-]\d{3}[.\-]\d{4})/);
            results.directorPhone = phoneMatch ? phoneMatch[1] : null;

            const gateMatch = text.match(/Gate Fee[:\s]*(\$[\d,]+|TBA|Free)/i);
            results.gateFee = gateMatch ? gateMatch[1] : null;

            results.stayToPlay = /stay.?to.?play/i.test(text);

            return results;
        });

        console.log('\n   Extracted data:');
        console.log(`   - Title: ${eventData.title}`);
        console.log(`   - City: ${eventData.city}`);
        console.log(`   - Raw date text: "${eventData.rawDateText}"`);
        console.log(`   - Start date: ${eventData.startDate}`);
        console.log(`   - End date: ${eventData.endDate}`);
        console.log(`   - Entry fee: ${eventData.entryFee}`);
        console.log(`   - Age groups: ${eventData.ageGroups?.join(', ')}`);
        console.log(`   - Format: ${eventData.format}`);
        console.log(`   - Director email: ${eventData.directorEmail}`);
        console.log(`   - Director phone: ${eventData.directorPhone}`);
        console.log(`   - Gate fee: ${eventData.gateFee}`);
        console.log(`   - Stay to play: ${eventData.stayToPlay}`);

        // Click Venues tab
        console.log('\n3. Clicking Venues tab...');
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
            console.log('   Clicked Venues tab');
            await new Promise(r => setTimeout(r, 1500));
        } else {
            console.log('   Could not find Venues tab');
        }

        // Scrape venues
        console.log('\n4. Scraping venues...');
        const venues = await page.evaluate(() => {
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

        console.log(`\n   Found ${venues.length} venue(s):`);
        venues.forEach((v, i) => {
            console.log(`   ${i + 1}. ${v.name}`);
            console.log(`      Address: ${v.address || 'N/A'}`);
            console.log(`      City: ${v.city || 'N/A'}`);
        });

        // Build tournament object
        const tournament = {
            name: nameFromUrl,
            startDate: parseDate(eventData.startDate),
            endDate: parseDate(eventData.endDate),
            entryFee: eventData.entryFee,
            ageGroups: eventData.ageGroups || [],
            format: eventData.format,
            directorEmail: eventData.directorEmail,
            directorPhone: eventData.directorPhone,
            city: eventData.city || venues[0]?.city,
            state: 'FL',
            stayToPlay: eventData.stayToPlay,
            gateAdmission: eventData.gateFee,
            venues: venues,
            venueName: venues[0]?.name,
            registrationUrl: TEST_URL,
            sourceUrl: TEST_URL,
            organization: 'USSSA',
            sport: 'baseball',
            externalId: getExternalIdFromUrl(TEST_URL)
        };

        console.log('\n5. Final tournament object:');
        console.log(JSON.stringify(tournament, null, 2));

        // Insert into database
        console.log('\n6. Inserting into database...');

        if (!tournament.startDate) {
            console.log('   ❌ Cannot insert - no start date');
        } else {
            try {
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
                console.log(`   ✓ Tournament inserted with ID: ${tournamentId}`);

                // Link venues (create if they don't exist)
                if (tournamentId && tournament.venues.length > 0) {
                    console.log('\n7. Linking venues (creating if needed)...');

                    for (let i = 0; i < tournament.venues.length; i++) {
                        const venue = tournament.venues[i];

                        // Find matching venue in venues table
                        const venueResult = await pool.query(`
                            SELECT id, name FROM venues 
                            WHERE name ILIKE $1 
                            OR name ILIKE $2
                            LIMIT 1
                        `, [`%${venue.name}%`, venue.name]);

                        let venueId = venueResult.rows[0]?.id;
                        let venueName = venueResult.rows[0]?.name;

                        // If venue doesn't exist, create it
                        if (!venueId) {
                            console.log(`   📍 Creating new venue: ${venue.name}`);

                            // Generate slug from name
                            const slug = venue.name
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-|-$/g, '');

                            // Generate ID
                            const citySlug = (venue.city || tournament.city || 'unknown')
                                .toLowerCase()
                                .replace(/\s+/g, '-');
                            const id = `${slug}-${citySlug}`;

                            try {
                                const newVenue = await pool.query(`
                                    INSERT INTO venues (id, name, slug, city, state, address)
                                    VALUES ($1, $2, $3, $4, $5, $6)
                                    ON CONFLICT (id) DO UPDATE SET
                                        name = EXCLUDED.name,
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

                                venueId = newVenue.rows[0]?.id;
                                venueName = newVenue.rows[0]?.name;
                                console.log(`      ✓ Created venue with ID: ${venueId}`);
                            } catch (err) {
                                // Handle duplicate slug
                                if (err.message.includes('duplicate key') && err.message.includes('slug')) {
                                    // Try with city suffix on slug
                                    const newSlug = `${slug}-${citySlug}`;
                                    const newId = `${newSlug}-venue`;

                                    try {
                                        const retryVenue = await pool.query(`
                                            INSERT INTO venues (id, name, slug, city, state, address)
                                            VALUES ($1, $2, $3, $4, $5, $6)
                                            RETURNING id, name
                                        `, [
                                            newId,
                                            venue.name,
                                            newSlug,
                                            venue.city || tournament.city || 'Unknown',
                                            tournament.state || 'FL',
                                            venue.address
                                        ]);

                                        venueId = retryVenue.rows[0]?.id;
                                        venueName = retryVenue.rows[0]?.name;
                                        console.log(`      ✓ Created venue with ID: ${venueId}`);
                                    } catch (retryErr) {
                                        console.log(`      ❌ Error creating venue: ${retryErr.message}`);
                                    }
                                } else {
                                    console.log(`      ❌ Error creating venue: ${err.message}`);
                                }
                            }
                        } else {
                            console.log(`   ✓ Found existing venue: ${venueName}`);
                        }

                        // Link tournament to venue
                        if (venueId) {
                            try {
                                await pool.query(`
                                    INSERT INTO tournament_venues (tournament_id, venue_id, is_primary)
                                    VALUES ($1, $2, $3)
                                    ON CONFLICT (tournament_id, venue_id) DO UPDATE SET
                                        is_primary = EXCLUDED.is_primary
                                `, [tournamentId, venueId, i === 0]);

                                console.log(`      ✓ Linked tournament to: ${venueName || venue.name}`);
                            } catch (linkErr) {
                                console.log(`      ❌ Error linking venue: ${linkErr.message}`);
                            }
                        }
                    }
                }

                // Verify insertion
                console.log('\n8. Verifying...');
                const verify = await pool.query(`
                    SELECT t.*, 
                           array_agg(v.name) as linked_venue_names,
                           array_agg(v.id) as linked_venue_ids
                    FROM tournaments t
                    LEFT JOIN tournament_venues tv ON t.id = tv.tournament_id
                    LEFT JOIN venues v ON tv.venue_id = v.id
                    WHERE t.id = $1
                    GROUP BY t.id
                `, [tournamentId]);

                if (verify.rows[0]) {
                    const row = verify.rows[0];
                    console.log('   Tournament in database:');
                    console.log(`   - ID: ${row.id}`);
                    console.log(`   - Name: ${row.name}`);
                    console.log(`   - Dates: ${row.start_date} to ${row.end_date}`);
                    console.log(`   - City: ${row.city}, ${row.state}`);
                    console.log(`   - Primary Venue: ${row.venue_name}`);
                    console.log(`   - Age groups: ${row.age_groups}`);
                    console.log(`   - Entry fee: ${row.entry_fee}`);
                    console.log(`   - Linked venues: ${row.linked_venue_names?.filter(Boolean).join(', ') || 'None'}`);
                }

                // Show tournament_venues table
                console.log('\n9. Tournament_venues entries:');
                const tvRows = await pool.query(`
                    SELECT tv.*, v.name as venue_name
                    FROM tournament_venues tv
                    JOIN venues v ON tv.venue_id = v.id
                    WHERE tv.tournament_id = $1
                `, [tournamentId]);

                tvRows.rows.forEach((row, i) => {
                    console.log(`   ${i + 1}. ${row.venue_name} (${row.venue_id}) - Primary: ${row.is_primary}`);
                });

            } catch (err) {
                console.log(`   ❌ Database error: ${err.message}`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('Test complete! Browser will close in 10 seconds...');
        console.log('='.repeat(60));

        await new Promise(r => setTimeout(r, 10000));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await browser.close();
        await pool.end();
    }
}

testSingleEvent();