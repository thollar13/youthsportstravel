const pool = require("../../config/db");
const { scrapeNewEvents, updateStatuses } = require("../../services/tournamentScraper");

module.exports = async (req, res) => {
    req.setTimeout(0);
    res.setTimeout(0);

    try {
        const maxPages = parseInt(req.query.pages) || 20;
        const concurrency = parseInt(req.query.concurrency) || 5;

        // Organizations
        let organizations = ['USSSA'];

        // States - comma separated, defaults to FL
        let states = ['FL'];
        const stateParam = req.query.states?.toUpperCase();
        if (stateParam) {
            states = stateParam.split(',').map(s => s.trim());
        }

        // Sports - comma separated
        let sports = ['baseball', 'fastpitch'];
        const sportParam = req.query.sports?.toLowerCase();
        if (sportParam === 'baseball') {
            sports = ['baseball'];
        } else if (sportParam === 'fastpitch') {
            sports = ['fastpitch'];
        }

        console.log(`\nScrape request:`);
        console.log(`  Organizations: ${organizations.join(', ')}`);
        console.log(`  States: ${states.join(', ')}`);
        console.log(`  Sports: ${sports.join(', ')}`);
        console.log(`  Max pages per site: ${maxPages}`);
        console.log(`  Concurrency: ${concurrency}`);

        const result = await scrapeNewEvents(pool, maxPages, organizations, {
            states,
            sports,
            concurrency
        });

        await updateStatuses(pool);

        res.json({
            message: "Scrape completed",
            organizations,
            states,
            sports,
            ...result
        });

    } catch (error) {
        console.error("Error scraping tournaments:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};