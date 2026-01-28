// getTournaments.js
const pool = require("../../config/db");
const { geocodeZipCodeCached } = require("../../services/geocoding");

module.exports = async (req, res) => {
    const {
        state,
        limit = 50,
        page = 1,
        search,
        organization,
        month,
        status = "upcoming",
        zip,           // Zip code for radius search
        radius = 150   // Radius in miles (default 150)
    } = req.query;

    try {
        const params = [];
        let whereConditions = [];
        let useRadiusFilter = false;
        let originCoords = null;
        let locationInfo = null;

        // If zip code provided, geocode it via Google
        if (zip && /^\d{5}$/.test(zip)) {
            const geoResult = await geocodeZipCodeCached(zip);

            if (!geoResult) {
                return res.status(400).json({
                    message: `Could not find location for zip code: ${zip}`,
                    hint: "Please check the zip code and try again"
                });
            }

            originCoords = { lat: geoResult.lat, lng: geoResult.lng };
            locationInfo = {
                zip,
                city: geoResult.city,
                state: geoResult.state,
                formattedAddress: geoResult.formattedAddress
            };
            useRadiusFilter = true;
        }

        // Base condition - only future tournaments for "upcoming"
        if (status === "upcoming") {
            whereConditions.push("t.start_date >= CURRENT_DATE");
        }

        // State filter (skip if using radius - radius is cross-state)
        if (state && !useRadiusFilter) {
            params.push(state.toUpperCase());
            whereConditions.push(`(v.state = $${params.length} OR t.state = $${params.length})`);
        }

        // Organization filter
        if (organization) {
            params.push(organization);
            whereConditions.push(`t.organization = $${params.length}`);
        }

        // Month filter (YYYY-MM format)
        if (month) {
            const [year, monthNum] = month.split('-');
            if (year && monthNum) {
                params.push(parseInt(year));
                params.push(parseInt(monthNum));
                whereConditions.push(`EXTRACT(YEAR FROM t.start_date) = $${params.length - 1} AND EXTRACT(MONTH FROM t.start_date) = $${params.length}`);
            }
        }

        // Search filter
        if (search && search.trim()) {
            params.push(`%${search.trim().toLowerCase()}%`);
            whereConditions.push(`(
                LOWER(t.name) LIKE $${params.length} OR 
                LOWER(t.city) LIKE $${params.length} OR 
                LOWER(COALESCE(v.name, t.venue_name, '')) LIKE $${params.length}
            )`);
        }

        // For radius filter, we need venues with coordinates
        let radiusFilterSQL = '';
        if (useRadiusFilter) {
            whereConditions.push("v.latitude IS NOT NULL AND v.longitude IS NOT NULL");

            // Add the distance filter using Haversine formula
            // 3959 = Earth's radius in miles
            params.push(originCoords.lat);
            params.push(originCoords.lng);
            params.push(parseFloat(radius));

            radiusFilterSQL = `
                AND (3959 * acos(
                    LEAST(1.0, GREATEST(-1.0,
                        cos(radians($${params.length - 2})) * cos(radians(v.latitude)) *
                        cos(radians(v.longitude) - radians($${params.length - 1})) +
                        sin(radians($${params.length - 2})) * sin(radians(v.latitude))
                    ))
                )) <= $${params.length}
            `;
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')} ${radiusFilterSQL}`
            : (radiusFilterSQL ? `WHERE 1=1 ${radiusFilterSQL}` : '');

        // Build SELECT clause
        let selectClause = `
            SELECT DISTINCT ON (t.id) t.*, 
                   COALESCE(v.name, t.venue_name) as venue_name, 
                   COALESCE(v.city, t.city) as venue_city, 
                   COALESCE(v.state, t.state) as venue_state,
                   v.slug as venue_slug,
                   v.latitude as venue_lat,
                   v.longitude as venue_lng
        `;

        // Add distance calculation if using radius
        if (useRadiusFilter) {
            selectClause = `
                SELECT DISTINCT ON (t.id) t.*, 
                       COALESCE(v.name, t.venue_name) as venue_name, 
                       COALESCE(v.city, t.city) as venue_city, 
                       COALESCE(v.state, t.state) as venue_state,
                       v.slug as venue_slug,
                       v.latitude as venue_lat,
                       v.longitude as venue_lng,
                       (3959 * acos(
                           LEAST(1.0, GREATEST(-1.0,
                               cos(radians($${params.length - 2})) * cos(radians(v.latitude)) *
                               cos(radians(v.longitude) - radians($${params.length - 1})) +
                               sin(radians($${params.length - 2})) * sin(radians(v.latitude))
                           ))
                       )) as distance_miles
            `;
        }

        const fromClause = `
            FROM tournaments t
            LEFT JOIN tournament_venues tv ON t.id = tv.tournament_id AND tv.is_primary = true
            LEFT JOIN venues v ON tv.venue_id = v.id OR t.venue_id = v.id
        `;

        // Count query
        const countQuery = `
            SELECT COUNT(DISTINCT t.id) as total
            ${fromClause}
            ${whereClause}
        `;

        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Main query with pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const paginationParams = [...params, parseInt(limit), offset];

        // Wrap in subquery for proper DISTINCT ON + ORDER BY
        const orderClause = useRadiusFilter
            ? "ORDER BY distance_miles ASC, start_date ASC"
            : "ORDER BY start_date ASC";

        const dataQuery = `
            SELECT * FROM (
                ${selectClause}
                ${fromClause}
                ${whereClause}
                ORDER BY t.id, t.start_date ASC
            ) as tournaments
            ${orderClause}
            LIMIT $${paginationParams.length - 1} OFFSET $${paginationParams.length}
        `;

        const result = await pool.query(dataQuery, paginationParams);

        // Round distance for display
        let tournaments = result.rows;
        if (useRadiusFilter) {
            tournaments = tournaments.map(t => ({
                ...t,
                distance_miles: t.distance_miles ? Math.round(t.distance_miles * 10) / 10 : null
            }));
        }

        // Pagination info
        const totalPages = Math.ceil(total / parseInt(limit));
        const currentPage = parseInt(page);

        res.json({
            tournaments,
            pagination: {
                total,
                page: currentPage,
                limit: parseInt(limit),
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            },
            filters: {
                zip: zip || null,
                radius: useRadiusFilter ? parseFloat(radius) : null,
                location: locationInfo
            }
        });
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};