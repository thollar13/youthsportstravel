const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;
    const {
        venue_id,
        name,
        address,
        distance_miles,
        drive_minutes,
        price_range,
        price_tier,
        amenities,
        why_good,
        booking_url,
        affiliate_url,
        affiliate_provider,
        family_friendly,
    } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }

    try {
        const result = await pool.query(
            `UPDATE hotels SET
                venue_id = $1,
                name = $2,
                address = $3,
                distance_miles = $4,
                drive_minutes = $5,
                price_range = $6,
                price_tier = $7,
                amenities = $8,
                why_good = $9,
                booking_url = $10,
                affiliate_url = $11,
                affiliate_provider = $12,
                family_friendly = $13,
                updated_at = NOW()
            WHERE id = $14
            RETURNING *`,
            [
                venue_id || null,
                name,
                address || null,
                distance_miles || null,
                drive_minutes || null,
                price_range || null,
                price_tier || "mid",
                amenities || [],
                why_good || null,
                booking_url || null,
                affiliate_url || null,
                affiliate_provider || null,
                family_friendly || false,
                id,
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Hotel not found" });
        }

        res.json({ message: "Hotel updated", hotel: result.rows[0] });
    } catch (error) {
        console.error("Error updating hotel:", error);
        res.status(500).json({ message: "Server error" });
    }
};