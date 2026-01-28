const pool = require("../../config/db");
const { v4: uuidv4 } = require("uuid");

module.exports = async (req, res) => {
    const {
        venue_id,
        name,
        address,
        distance_miles,
        drive_minutes,
        price_range,
        price_tier,
        why_good,
        amenities,
        family_friendly,
        booking_url,
        affiliate_url,
        affiliate_provider,
        photo_reference
    } = req.body;

    if (!venue_id || !name) {
        return res.status(400).json({ message: "venue_id and name are required" });
    }

    try {
        const id = uuidv4();
        const result = await pool.query(
            `INSERT INTO hotels (
                id, venue_id, name, address, distance_miles, drive_minutes,
                price_range, price_tier, why_good, amenities, family_friendly,
                booking_url, affiliate_url, affiliate_provider, photo_reference,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()
            ) RETURNING *`,
            [
                id, venue_id, name, address, distance_miles, drive_minutes,
                price_range, price_tier, why_good, amenities, family_friendly,
                booking_url, affiliate_url, affiliate_provider, photo_reference
            ]
        );

        res.status(201).json({ hotel: result.rows[0] });
    } catch (error) {
        console.error("Error adding hotel:", error);
        res.status(500).json({ message: "Server error" });
    }
};