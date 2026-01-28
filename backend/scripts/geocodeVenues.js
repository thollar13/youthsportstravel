// scripts/geocodeVenues.js
// One-time script to add lat/lng coordinates to all venues
// Run: node scripts/geocodeVenues.js
//
// Requires: GOOGLE_MAPS_API_KEY environment variable

const pool = require('../config/db');
const { geocodeAddress } = require('../services/geocoding');

const DELAY_MS = 200; // Delay between API calls to avoid rate limiting

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeVenues() {
    console.log('Starting venue geocoding...\n');

    // Ensure columns exist
    await pool.query(`
        ALTER TABLE venues ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 7);
        ALTER TABLE venues ADD COLUMN IF NOT EXISTS longitude DECIMAL(10, 7);
        ALTER TABLE venues ADD COLUMN IF NOT EXISTS geocoded_at TIMESTAMP;
    `);

    // Get venues without coordinates
    const result = await pool.query(`
        SELECT id, name, address, city, state 
        FROM venues 
        WHERE latitude IS NULL OR longitude IS NULL
        ORDER BY name
    `);

    console.log(`Found ${result.rows.length} venues to geocode\n`);

    let success = 0;
    let failed = 0;

    for (const venue of result.rows) {
        // Build address string
        const addressParts = [
            venue.address,
            venue.city,
            venue.state
        ].filter(Boolean);

        if (addressParts.length < 2) {
            console.log(`⏭️  Skipping "${venue.name}" - insufficient address info`);
            failed++;
            continue;
        }

        const addressString = addressParts.join(', ');
        console.log(`📍 Geocoding: ${venue.name}`);
        console.log(`   Address: ${addressString}`);

        const coords = await geocodeAddress(addressString);

        if (coords) {
            await pool.query(`
                UPDATE venues 
                SET latitude = $1, longitude = $2, geocoded_at = NOW()
                WHERE id = $3
            `, [coords.lat, coords.lng, venue.id]);

            console.log(`   ✅ ${coords.lat}, ${coords.lng}\n`);
            success++;
        } else {
            // Try with just city, state
            const fallbackAddress = `${venue.city}, ${venue.state}`;
            console.log(`   ⚠️  Trying fallback: ${fallbackAddress}`);

            const fallbackCoords = await geocodeAddress(fallbackAddress);
            if (fallbackCoords) {
                await pool.query(`
                    UPDATE venues 
                    SET latitude = $1, longitude = $2, geocoded_at = NOW()
                    WHERE id = $3
                `, [fallbackCoords.lat, fallbackCoords.lng, venue.id]);

                console.log(`   ✅ ${fallbackCoords.lat}, ${fallbackCoords.lng} (city-level)\n`);
                success++;
            } else {
                console.log(`   ❌ Failed to geocode\n`);
                failed++;
            }
        }

        await sleep(DELAY_MS);
    }

    console.log('\n========================================');
    console.log(`Geocoding complete!`);
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('========================================\n');

    // Show summary
    const summary = await pool.query(`
        SELECT 
            COUNT(*) as total,
            COUNT(latitude) as geocoded,
            COUNT(*) - COUNT(latitude) as missing
        FROM venues
    `);
    console.log('Venue Summary:');
    console.log(`  Total: ${summary.rows[0].total}`);
    console.log(`  Geocoded: ${summary.rows[0].geocoded}`);
    console.log(`  Missing coordinates: ${summary.rows[0].missing}`);
}

// Run
geocodeVenues()
    .then(() => {
        console.log('\nDone!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });