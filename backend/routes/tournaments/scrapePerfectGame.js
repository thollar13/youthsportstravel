const pool = require("../../config/db");
const { scrapeNewEvents } = require("../../services/perfectGameScraper");

module.exports = async (req, res) => {
    req.setTimeout(0);
    res.setTimeout(0);

    try {
        // States - comma separated, defaults to FL
        let states = ['FL'];
        const stateParam = req.query.states?.toUpperCase();
        if (stateParam) {
            states = stateParam.split(',').map(s => s.trim());
        }

        // Fetch details - defaults to true for venue extraction
        const fetchDetails = req.query.details !== 'false';

        console.log(`\nPerfect Game scrape request:`);
        console.log(`  States: ${states.join(', ')}`);
        console.log(`  Fetch Details: ${fetchDetails}`);

        const result = await scrapeNewEvents(pool, {
            states,
            fetchDetails
        });

        res.json({
            message: "Perfect Game scrape completed",
            organization: "Perfect Game",
            states,
            fetchDetails,
            ...result
        });

    } catch (error) {
        console.error("Error scraping Perfect Game tournaments:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};