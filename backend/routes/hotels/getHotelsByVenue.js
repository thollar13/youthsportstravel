const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { venueId } = req.params;

    try {
        const query = `
      SELECT * FROM hotels 
      WHERE venue_id = $1 
      ORDER BY 
        CASE price_tier 
          WHEN 'budget' THEN 1 
          WHEN 'mid' THEN 2 
          WHEN 'upscale' THEN 3 
        END,
        distance_miles ASC
    `;
        const result = await pool.query(query, [venueId]);

        res.status(200).json({
            message: "success",
            hotels: result.rows,
        });
    } catch (error) {
        console.error("Error fetching hotels:", error);
        res.status(500).json({ message: "Server error" });
    }
};