// api/venues/getRestaurantsByVenue.js
const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { venueId } = req.params;

    try {
        // Get venue ID if slug was passed
        let id = venueId;
        if (isNaN(venueId)) {
            const venueResult = await pool.query(
                "SELECT id FROM venues WHERE slug = $1",
                [venueId]
            );
            if (venueResult.rows.length === 0) {
                return res.status(404).json({ message: "Venue not found" });
            }
            id = venueResult.rows[0].id;
        }

        const result = await pool.query(
            `SELECT * FROM venue_restaurants 
             WHERE venue_id = $1 
             ORDER BY sort_order ASC, name ASC`,
            [id]
        );

        res.json({ restaurants: result.rows });
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({ message: "Server error" });
    }
};