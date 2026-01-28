// testPerfectGameScraper.js
// Test script to run the Perfect Game scraper
//
// Usage:
//   node testPerfectGameScraper.js              # Test mode (no database)
//   node testPerfectGameScraper.js --db         # Insert into database
//   node testPerfectGameScraper.js --details    # Fetch additional event details

const { scrapeNewEvents, testScraper, PG_REGIONS } = require('../services/perfectGameScraper');

// Show available regions
console.log('Available Perfect Game Regions:');
console.log(JSON.stringify(PG_REGIONS, null, 2));
console.log('\n');

const args = process.argv.slice(2);
const useDatabase = args.includes('--db');
const fetchDetails = args.includes('--details');

async function run() {
    if (useDatabase) {
        // Connect to your database
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/your_db'
        });

        try {
            const result = await scrapeNewEvents(pool, {
                states: ['FL'],
                fetchDetails: fetchDetails
            });

            console.log('\nFinal Result:');
            console.log(JSON.stringify(result, null, 2));
        } finally {
            await pool.end();
        }
    } else {
        // Test mode - no database
        const tournaments = await testScraper();
        console.log(`\nTest complete. Found ${tournaments.length} tournaments.`);
    }
}

run().catch(console.error);