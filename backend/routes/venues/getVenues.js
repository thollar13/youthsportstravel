const pool = require("../../config/db");

module.exports = async (req, res) => {
    const { state, sport, include_unpublished } = req.query;

    try {
        const params = [];
        const conditions = [];

        // Only show published venues by default
        // Pass ?include_unpublished=true for admin views
        if (include_unpublished !== 'true') {
            conditions.push("v.is_published = TRUE");
        }

        // Filter by state
        if (state) {
            params.push(state.toUpperCase());
            conditions.push(`v.state = $${params.length}`);
        }

        // Filter by sport (checks if sport is in the sports array)
        if (sport) {
            params.push(sport.toLowerCase());
            conditions.push(`$${params.length} = ANY(v.sports)`);
        }

        // Main query with hotel count
        let query = `
            SELECT 
                v.id,
                v.slug,
                v.name,
                v.city,
                v.state,
                v.address,
                v.latitude,
                v.longitude,
                v.fields,
                v.surface,
                v.sports,
                v.overview,
                v.is_published,
                v.meta_title,
                v.meta_description,
                v.created_at,
                v.updated_at,
                COUNT(DISTINCT vh.id) as hotel_count
            FROM venues v
            LEFT JOIN venue_hotels vh ON v.id = vh.venue_id
        `;

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += `
            GROUP BY v.id
            ORDER BY v.name ASC
        `;

        const result = await pool.query(query, params);

        // Format response
        const venues = result.rows.map(venue => ({
            ...venue,
            hotel_count: parseInt(venue.hotel_count) || 0,
            sports: venue.sports || ['baseball'] // Default to baseball if not set
        }));

        res.status(200).json({
            venues,
            count: venues.length
        });
    } catch (error) {
        console.error("Error fetching venues:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};