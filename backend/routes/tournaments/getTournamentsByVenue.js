// getTournamentsByVenue.js
const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { venueId } = req.params;

    try {
        // First, resolve the actual venue ID (could be id or slug)
        const venueResult = await pool.query(`
            SELECT id FROM venues WHERE id = $1 OR slug = $1
        `, [venueId]);

        if (venueResult.rows.length === 0) {
            return res.json({ tournaments: [] });
        }

        const actualVenueId = venueResult.rows[0].id;

        // Now query tournaments with the actual venue ID
        const result = await pool.query(`
            SELECT DISTINCT t.*
            FROM tournaments t
            WHERE 
                t.venue_id = $1
                OR t.id IN (
                    SELECT tournament_id FROM tournament_venues WHERE venue_id = $1
                )
            ORDER BY t.start_date ASC
        `, [actualVenueId]);

        res.json({ tournaments: result.rows });
    } catch (error) {
        console.error("Error fetching tournaments by venue:", error);
        res.status(500).json({ message: "Server error" });
    }
};