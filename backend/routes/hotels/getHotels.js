const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { venue_id } = req.query;

    try {
        let query = `
            SELECT h.*, v.name as venue_name, v.city as venue_city, v.state as venue_state
            FROM hotels h
            LEFT JOIN venues v ON h.venue_id = v.id
        `;
        const params = [];

        if (venue_id) {
            params.push(venue_id);
            query += ` WHERE h.venue_id = $1`;
        }

        query += ` ORDER BY h.name ASC`;

        const result = await pool.query(query, params);
        res.json({ hotels: result.rows });
    } catch (error) {
        console.error("Error fetching hotels:", error);
        res.status(500).json({ message: "Server error" });
    }
};