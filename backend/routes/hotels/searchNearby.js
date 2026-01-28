const pool = require("../../config/db");

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

module.exports = async (req, res) => {
    const { venue_id } = req.query;

    if (!venue_id) {
        return res.status(400).json({ message: "venue_id required" });
    }

    try {
        // Get venue coordinates
        const venueResult = await pool.query(
            "SELECT id, name, city, state, lat, lng FROM venues WHERE id = $1",
            [venue_id]
        );

        if (venueResult.rows.length === 0) {
            return res.status(404).json({ message: "Venue not found" });
        }

        const venue = venueResult.rows[0];

        if (!venue.lat || !venue.lng) {
            return res.status(400).json({
                message: "Venue missing coordinates. Please add lat/lng first."
            });
        }

        if (!GOOGLE_PLACES_API_KEY) {
            return res.status(500).json({
                message: "Google Places API key not configured. Add GOOGLE_PLACES_API_KEY to .env"
            });
        }

        // Search Google Places for nearby hotels
        const radius = 8000; // 8km (~5 miles)
        const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${venue.lat},${venue.lng}&radius=${radius}&type=lodging&key=${GOOGLE_PLACES_API_KEY}`;

        console.log("Searching hotels near:", venue.name, venue.lat, venue.lng);

        const response = await fetch(url);
        const data = await response.json();

        console.log("Google Places status:", data.status);

        if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
            console.error("Google Places error:", data);
            return res.status(500).json({
                message: `Google Places error: ${data.status}. ${data.error_message || ""}`
            });
        }

        // Transform results - include photo_reference
        const hotels = (data.results || []).map((place) => ({
            google_place_id: place.place_id,
            name: place.name,
            address: place.vicinity,
            lat: place.geometry?.location?.lat,
            lng: place.geometry?.location?.lng,
            rating: place.rating,
            total_ratings: place.user_ratings_total,
            price_level: place.price_level,
            photo_reference: place.photos?.[0]?.photo_reference || null,
        }));

        res.json({
            venue,
            hotels,
            count: hotels.length,
            api_key: GOOGLE_PLACES_API_KEY // Pass to frontend for photo URLs
        });
    } catch (error) {
        console.error("Error searching hotels:", error);
        res.status(500).json({ message: "Server error" });
    }
};