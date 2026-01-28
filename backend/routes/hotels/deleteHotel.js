const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM hotels WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        res.json({ message: "Hotel deleted", hotel: result.rows[0] });
    } catch (error) {
        console.error("Error deleting hotel:", error);
        res.status(500).json({ message: "Server error" });
    }
};