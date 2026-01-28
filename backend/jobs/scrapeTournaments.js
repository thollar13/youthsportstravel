// jobs/scrapeTournaments.js
const cron = require('node-cron');
const pool = require('../config/db');
const { scrapeNewEvents, updateStatuses } = require('../services/tournamentScraper');

/**
 * Run the weekly tournament scrape (both organizations)
 */
async function runWeeklyScrape() {
    console.log(`\n[${new Date().toISOString()}] Starting weekly tournament scrape...`);

    try {
        // const result = await scrapeNewEvents(pool, 20, ['USSSA', 'Perfect Game']);
        const result = await scrapeNewEvents(pool, 20, ['USSSA']);
        await updateStatuses(pool);

        console.log(`Weekly scrape complete:`);
        console.log(`  Scraped: ${result.scraped}`);
        console.log(`  Inserted: ${result.inserted}`);
        console.log(`  Skipped: ${result.skipped}`);

    } catch (error) {
        console.error('Weekly scrape failed:', error);
    }
}

/**
 * Run daily status update (marks tournaments as in_progress/completed)
 */
async function runDailyStatusUpdate() {
    try {
        await updateStatuses(pool);
        console.log(`[${new Date().toISOString()}] Tournament statuses updated`);
    } catch (error) {
        console.error('Status update failed:', error);
    }
}

/**
 * Initialize cron jobs
 */
function initTournamentJobs() {
    // Weekly scrape - Sunday at 2 AM
    cron.schedule('0 2 * * 0', runWeeklyScrape);

    // Daily status update - 6 AM every day
    cron.schedule('0 6 * * *', runDailyStatusUpdate);

    console.log('✓ Tournament jobs initialized');
    console.log('  - Weekly scrape: Sundays at 2:00 AM');
    console.log('  - Daily status update: 6:00 AM');
}

module.exports = {
    runWeeklyScrape,
    runDailyStatusUpdate,
    initTournamentJobs
};