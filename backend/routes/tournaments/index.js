// backend/routes/tournaments/index.js
const express = require("express");
const router = express.Router();

// GET /api/tournaments - Get all tournaments
router.get("/", async (req, res) => {
    try {
        const pool = req.app.get("pool");
        const result = await pool.query(`
            SELECT * FROM tournaments 
            WHERE status != 'completed' 
            ORDER BY start_date ASC
        `);
        res.json({ tournaments: result.rows });
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        res.status(500).json({ error: "Failed to fetch tournaments" });
    }
});

module.exports = router;