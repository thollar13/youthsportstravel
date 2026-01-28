require('dotenv').config();
const pool = require("../config/db");

async function linkTournamentsToVenues() {
    console.log("Linking tournaments to venues...\n");

    // Get all venues
    const venuesResult = await pool.query("SELECT id, name, city FROM venues");
    const venues = venuesResult.rows;

    // Get all tournaments
    const tournamentsResult = await pool.query(`
        SELECT id, name, venue_name, city 
        FROM tournaments 
        WHERE venue_name IS NOT NULL OR city IS NOT NULL
    `);
    const tournaments = tournamentsResult.rows;

    let linked = 0;

    for (const tournament of tournaments) {
        for (const venue of venues) {
            // Check if venue name appears in tournament venue_name
            const venueNameMatch = tournament.venue_name &&
                (tournament.venue_name.toLowerCase().includes(venue.name.toLowerCase()) ||
                    venue.name.toLowerCase().includes(tournament.venue_name.toLowerCase()));

            if (venueNameMatch) {
                try {
                    await pool.query(`
                        INSERT INTO tournament_venues (tournament_id, venue_id, is_primary)
                        VALUES ($1, $2, true)
                        ON CONFLICT (tournament_id, venue_id) DO NOTHING
                    `, [tournament.id, venue.id]);

                    console.log(`✓ Linked: "${tournament.name}" → "${venue.name}"`);
                    linked++;
                } catch (err) {
                    console.log(`  Error: ${err.message}`);
                }
            }
        }
    }

    console.log(`\nDone! Linked ${linked} tournament-venue pairs.`);

    // Show unlinked tournaments
    const unlinkedResult = await pool.query(`
        SELECT t.name, t.venue_name, t.city
        FROM tournaments t
        LEFT JOIN tournament_venues tv ON t.id = tv.tournament_id
        WHERE tv.id IS NULL AND t.start_date >= CURRENT_DATE
        ORDER BY t.start_date
        LIMIT 20
    `);

    if (unlinkedResult.rows.length > 0) {
        console.log(`\nUnlinked upcoming tournaments:`);
        unlinkedResult.rows.forEach(t => {
            console.log(`  - ${t.name} | ${t.venue_name || 'no venue'} | ${t.city || 'no city'}`);
        });
    }

    await pool.end();
}

linkTournamentsToVenues()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });