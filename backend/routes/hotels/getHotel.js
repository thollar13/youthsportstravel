const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            `SELECT h.*, v.name as venue_name, v.city as venue_city, v.state as venue_state
             FROM hotels h
             LEFT JOIN venues v ON h.venue_id = v.id
             WHERE h.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        res.json({ hotel: result.rows[0] });
    } catch (error) {
        console.error("Error fetching hotel:", error);
        res.status(500).json({ message: "Server error" });
    }
};