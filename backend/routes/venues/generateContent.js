const pool = require("../../config/db");
const {
    generateAndSaveVenueContent,
    generateContentForAllVenues,
} = require("../../services/venueContentGenerator");

module.exports = async (req, res) => {
    const { venueId } = req.params;
    const { force = false, limit = 10 } = req.query;

    try {
        // If venueId provided, generate for single venue
        if (venueId && venueId !== "all") {
            // Check if forcing regeneration
            if (force === "true") {
                // Delete existing content first
                await pool.query(
                    `UPDATE venues SET 
                        overview = NULL, 
                        what_to_expect = NULL,
                        where_to_stay = NULL,
                        where_to_eat = NULL,
                        things_to_do = NULL,
                        pro_tips = NULL
                    WHERE id = $1 OR slug = $1`,
                    [venueId]
                );
            }

            const result = await generateAndSaveVenueContent(pool, venueId);
            return res.json(result);
        }

        // Generate for all venues without content
        const result = await generateContentForAllVenues(pool, {
            limit: parseInt(limit),
            force: force === "true",
        });

        res.json(result);
    } catch (error) {
        console.error("Error generating venue content:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};