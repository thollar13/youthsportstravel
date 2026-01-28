// getTournaments.js
const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`
            SELECT t.*, 
                   v.name as venue_name, 
                   v.city as venue_city, 
                   v.state as venue_state,
                   v.slug as venue_slug
            FROM tournaments t
            JOIN venues v ON t.venue_id = v.id
            WHERE t.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.json({ tournament: result.rows[0] });
    } catch (error) {
        console.error("Error fetching tournament:", error);
        res.status(500).json({ message: "Server error" });
    }
};