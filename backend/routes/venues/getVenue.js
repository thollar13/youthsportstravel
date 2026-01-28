// api/venues/getVenue.js
const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;

    try {
        let result;

        // Check if id is numeric (ID) or string (slug)
        if (!isNaN(id)) {
            // Lookup by ID
            result = await pool.query(
                `SELECT * FROM venues WHERE id = $1`,
                [id]
            );
        } else {
            // Lookup by slug
            result = await pool.query(
                `SELECT * FROM venues WHERE slug = $1`,
                [id]
            );
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Venue not found" });
        }

        res.json({ venue: result.rows[0] });
    } catch (error) {
        console.error("Error fetching venue:", error);
        res.status(500).json({ message: "Server error" });
    }
};