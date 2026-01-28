const pool = require("../../config/db");

module.exports = async (req, res) => {
    const {
        id,
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
    if (!id || !name || !slug || !city || !state) {
        return res.status(400).json({
            message: "Missing required fields: id, name, slug, city, state"
        });
    }

    // Validate surface if provided
    if (surface && !["turf", "grass", "mixed"].includes(surface)) {
        return res.status(400).json({
            message: "Surface must be: turf, grass, or mixed"
        });
    }

    try {
        const query = `
      INSERT INTO venues (
        id, name, slug, city, state, address, lat, lng, fields, surface,
        sports, organizations, notable_events, website, phone,
        overview, what_to_expect, where_to_stay, where_to_eat, things_to_do,
        pro_tips, meta_title, meta_description
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23
      )
      RETURNING *
    `;

        const values = [
            id,
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
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Venue created",
            venue: result.rows[0],
        });
    } catch (error) {
        console.error("Error adding venue:", error);

        if (error.code === "23505") {
            return res.status(409).json({ message: "Venue with this id or slug already exists" });
        }

        res.status(500).json({ message: "Server error" });
    }
};