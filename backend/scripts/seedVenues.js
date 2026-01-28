// scripts/seedVenues.js
// Run: node scripts/seedVenues.js
//
// Options:
//   --clear     Clear existing venues before seeding
//   --publish   Mark all seeded venues as published
//
// Examples:
//   node scripts/seedVenues.js
//   node scripts/seedVenues.js --clear --publish

require('dotenv').config();

const pool = require('../config/db');
const venues = require('../seeds/venues');

const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');
const shouldPublish = args.includes('--publish');

async function seedVenues() {
    console.log('\n🌱 Seeding venues...\n');

    try {
        // Optionally clear existing venues
        if (shouldClear) {
            console.log('🗑️  Clearing existing venues...');
            await pool.query('DELETE FROM venue_faqs');
            await pool.query('DELETE FROM venue_tips');
            await pool.query('DELETE FROM venue_restaurants');
            await pool.query('DELETE FROM venue_hotels');
            await pool.query('DELETE FROM venues');
            console.log('   Done.\n');
        }

        let inserted = 0;
        let skipped = 0;
        let errors = 0;

        for (const venue of venues) {
            try {
                // Check if venue already exists
                const existing = await pool.query(
                    'SELECT id FROM venues WHERE slug = $1',
                    [venue.slug]
                );

                if (existing.rows.length > 0) {
                    console.log(`⏭️  Skipped (exists): ${venue.name}`);
                    skipped++;
                    continue;
                }

                // Insert venue
                await pool.query(`
                    INSERT INTO venues (
                        slug, name, city, state, address,
                        fields, surface, sports, overview,
                        is_published, meta_title, meta_description
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                `, [
                    venue.slug,
                    venue.name,
                    venue.city,
                    venue.state,
                    venue.address,
                    venue.fields,
                    venue.surface,
                    venue.sports,
                    venue.overview,
                    shouldPublish, // is_published
                    venue.meta_title,
                    venue.meta_description
                ]);

                console.log(`✅ Inserted: ${venue.name} (${venue.city}, ${venue.state})`);
                inserted++;

            } catch (err) {
                console.error(`❌ Error inserting ${venue.name}:`, err.message);
                errors++;
            }
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 SUMMARY');
        console.log('='.repeat(50));
        console.log(`   Total venues in seed:  ${venues.length}`);
        console.log(`   ✅ Inserted:           ${inserted}`);
        console.log(`   ⏭️  Skipped (existed):  ${skipped}`);
        console.log(`   ❌ Errors:             ${errors}`);
        console.log(`   📝 Published:          ${shouldPublish ? 'Yes' : 'No'}`);
        console.log('='.repeat(50));

        // Show state breakdown
        console.log('\n📍 BY STATE:');
        const stateCounts = {};
        for (const v of venues) {
            stateCounts[v.state] = (stateCounts[v.state] || 0) + 1;
        }
        Object.entries(stateCounts)
            .sort((a, b) => b[1] - a[1])
            .forEach(([state, count]) => {
                console.log(`   ${state}: ${count} venues`);
            });

        console.log('\n✨ Done!\n');

    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        await pool.end();
    }
}

seedVenues();