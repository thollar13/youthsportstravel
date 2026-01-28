const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        slug,
        city,
        state,
        address,
        lat,
        lng,
        fields,
        surface,
        sports,
        organizations,
        notable_events,
        website,
        phone,
        overview,
        what_to_expect,
        where_to_stay,
        where_to_eat,
        things_to_do,
        pro_tips,
        meta_title,
        meta_description,
    } = req.body;

    // Validate required fields
    if (!name || !slug || !city || !state) {
        return res.status(400).json({
            message: "Missing required fields: name, slug, city, state",
        });
    }

    // Validate surface if provided
    if (surface && !["turf", "grass", "mixed"].includes(surface)) {
        return res.status(400).json({
            message: "Surface must be: turf, grass, or mixed",
        });
    }

    try {
        const query = `
      UPDATE venues SET
        name = $1,
        slug = $2,
        city = $3,
        state = $4,
        address = $5,
        lat = $6,
        lng = $7,
        fields = $8,
        surface = $9,
        sports = $10,
        organizations = $11,
        notable_events = $12,
        website = $13,
        phone = $14,
        overview = $15,
        what_to_expect = $16,
        where_to_stay = $17,
        where_to_eat = $18,
        things_to_do = $19,
        pro_tips = $20,
        meta_title = $21,
        meta_description = $22
      WHERE id = $23
      RETURNING *
    `;

        const values = [
            name,
            slug,
            city,
            state,
            address || null,
            lat || null,
            lng || null,
            fields || null,
            surface || null,
            JSON.stringify(sports || ["baseball"]),
            JSON.stringify(organizations || []),
            JSON.stringify(notable_events || []),
            website || null,
            phone || null,
            overview || null,
            what_to_expect || null,
            where_to_stay || null,
            where_to_eat || null,
            things_to_do || null,
            JSON.stringify(pro_tips || []),
            meta_title || null,
            meta_description || null,
            id,
        ];

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Venue not found" });
        }

        res.status(200).json({
            message: "Venue updated",
            venue: result.rows[0],
        });
    } catch (error) {
        console.error("Error updating venue:", error);

        if (error.code === "23505") {
            return res.status(409).json({ message: "Venue with this slug already exists" });
        }

        res.status(500).json({ message: "Server error" });
    }
};