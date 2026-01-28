const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            "DELETE FROM tournaments WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Tournament not found" });
        }

        res.json({
            message: "Tournament deleted",
            id: result.rows[0].id,
        });
    } catch (error) {
        console.error("Error deleting tournament:", error);
        res.status(500).json({ message: "Server error" });
    }
};