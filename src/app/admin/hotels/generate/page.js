"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const BOOKING_AFFILIATE_ID = process.env.NEXT_PUBLIC_BOOKING_AFFILIATE_ID || "";

function getPriceTier(priceLevel) {
    if (priceLevel === undefined || priceLevel === null) return "mid";
    if (priceLevel <= 1) return "budget";
    if (priceLevel >= 3) return "upscale";
    return "mid";
}

function generateAffiliateUrl(hotelName, city, state) {
    const searchQuery = `${hotelName} ${city} ${state}`.trim();
    if (BOOKING_AFFILIATE_ID) {
        return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchQuery)}&aid=${BOOKING_AFFILIATE_ID}`;
    }
    // Fallback to Google Travel search
    return `https://www.google.com/travel/hotels?q=${encodeURIComponent(searchQuery)}`;
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
}

function getPhotoUrl(photoReference, apiKey, maxWidth = 400) {
    if (!photoReference || !apiKey) return null;
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${apiKey}`;
}

export default function GenerateHotelsPage() {
    const searchParams = useSearchParams();
    const preselectedVenueId = searchParams.get("venue");

    const [venues, setVenues] = useState([]);
    const [selectedVenue, setSelectedVenue] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedHotels, setSelectedHotels] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [googleApiKey, setGoogleApiKey] = useState("");

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const res = await fetch(`${API_URL}/api/venues`);
                const data = await res.json();
                setVenues(data.venues || []);

                if (preselectedVenueId) {
                    const venue = (data.venues || []).find(v => v.id === preselectedVenueId);
                    if (venue) {
                        setSelectedVenue(venue);
                    }
                }
            } catch (err) {
                console.error("Error fetching venues:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVenues();
    }, [preselectedVenueId]);

    const searchHotels = async () => {
        if (!selectedVenue) return;

        setIsSearching(true);
        setError("");
        setSearchResults([]);

        try {
            const res = await fetch(`${API_URL}/api/hotels/search-nearby?venue_id=${selectedVenue.id}`);
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to search hotels");
                return;
            }

            // Store API key for photo URLs
            if (data.api_key) {
                setGoogleApiKey(data.api_key);
            }

            // Transform and enrich results
            const hotels = data.hotels.map((hotel, index) => {
                const affiliateUrl = generateAffiliateUrl(hotel.name, selectedVenue.city, selectedVenue.state);

                return {
                    tempId: index,
                    venue_id: selectedVenue.id,
                    name: hotel.name,
                    address: hotel.address,
                    distance_miles: calculateDistance(
                        selectedVenue.lat, selectedVenue.lng,
                        hotel.lat, hotel.lng
                    ),
                    price_tier: getPriceTier(hotel.price_level),
                    rating: hotel.rating,
                    total_ratings: hotel.total_ratings,
                    affiliate_url: affiliateUrl,
                    affiliate_provider: BOOKING_AFFILIATE_ID ? "booking" : "google",
                    amenities: [],
                    family_friendly: true,
                    google_place_id: hotel.google_place_id,
                    photo_reference: hotel.photo_reference,
                    photo_url: getPhotoUrl(hotel.photo_reference, data.api_key),
                };
            });

            // Sort by distance
            hotels.sort((a, b) => parseFloat(a.distance_miles) - parseFloat(b.distance_miles));

            setSearchResults(hotels);
            // Pre-select top 10 closest
            setSelectedHotels(hotels.slice(0, 10).map(h => h.tempId));
            setSaved(false);
        } catch (err) {
            setError("Failed to search hotels");
        } finally {
            setIsSearching(false);
        }
    };

    const handleVenueChange = (venueId) => {
        const venue = venues.find(v => v.id === venueId);
        setSelectedVenue(venue);
        setSearchResults([]);
        setSelectedHotels([]);
        setSaved(false);
        setError("");
    };

    const toggleHotel = (tempId) => {
        setSelectedHotels(prev =>
            prev.includes(tempId)
                ? prev.filter(id => id !== tempId)
                : [...prev, tempId]
        );
    };

    const saveSelectedHotels = async () => {
        setSaving(true);
        setError("");

        try {
            const hotelsToSave = searchResults.filter(h => selectedHotels.includes(h.tempId));

            for (const hotel of hotelsToSave) {
                const { tempId, rating, total_ratings, google_place_id, photo_url, ...hotelData } = hotel;

                await fetch(`${API_URL}/api/hotels`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(hotelData),
                });
            }

            setSaved(true);
        } catch (err) {
            setError("Error saving hotels. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const tierColors = {
        budget: "bg-green-100 text-green-700",
        mid: "bg-blue-100 text-blue-700",
        upscale: "bg-purple-100 text-purple-700",
    };

    return (
        <div>
            <div className="mb-8">
                <Link href="/admin/hotels" className="text-sm text-green-600 hover:text-green-700">
                    ← Back to Hotels
                </Link>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Generate Hotels</h1>
                <p className="mt-2 text-gray-600">
                    Search for real hotels near a venue using Google Places
                </p>
            </div>

            {/* Venue Selector */}
            <div className="mb-6 rounded-xl bg-white border border-gray-200 p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select a Venue
                </label>
                <div className="flex gap-3">
                    <select
                        value={selectedVenue?.id || ""}
                        onChange={(e) => handleVenueChange(e.target.value)}
                        className="flex-1 max-w-md rounded-lg border border-gray-300 px-4 py-2.5"
                        disabled={isLoading}
                    >
                        <option value="">Choose a venue...</option>
                        {venues.map((venue) => (
                            <option key={venue.id} value={venue.id}>
                                {venue.name} ({venue.city}, {venue.state})
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={searchHotels}
                        disabled={!selectedVenue || isSearching || !selectedVenue?.lat}
                        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSearching ? "Searching..." : "🔍 Search Hotels"}
                    </button>
                </div>
                {selectedVenue && !selectedVenue.lat && (
                    <p className="mt-2 text-sm text-amber-600">
                        ⚠️ This venue is missing coordinates.
                        <Link href={`/admin/venues/${selectedVenue.id}/edit`} className="underline ml-1">
                            Add lat/lng first
                        </Link>
                    </p>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Results */}
            {saved ? (
                <div className="rounded-xl bg-green-50 border border-green-200 p-8 text-center">
                    <div className="text-4xl mb-4">✅</div>
                    <h2 className="text-xl font-bold text-green-800 mb-2">
                        {selectedHotels.length} Hotels Saved!
                    </h2>
                    <p className="text-green-700 mb-6">
                        Hotels have been added to {selectedVenue?.name}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link
                            href={`/admin/hotels?venue_id=${selectedVenue?.id}`}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                            View Hotels
                        </Link>
                        <button
                            onClick={() => {
                                setSelectedVenue(null);
                                setSearchResults([]);
                                setSelectedHotels([]);
                                setSaved(false);
                            }}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Search Another Venue
                        </button>
                    </div>
                </div>
            ) : searchResults.length > 0 ? (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            {searchResults.length} Hotels Found near {selectedVenue?.name}
                        </h2>
                        <span className="text-sm text-gray-500">
                            {selectedHotels.length} selected
                        </span>
                    </div>

                    <div className="space-y-3 mb-6">
                        {searchResults.map((hotel) => (
                            <div
                                key={hotel.tempId}
                                className={`rounded-lg border p-4 transition-all cursor-pointer ${selectedHotels.includes(hotel.tempId)
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                                onClick={() => toggleHotel(hotel.tempId)}
                            >
                                <div className="flex items-start gap-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedHotels.includes(hotel.tempId)}
                                        onChange={() => toggleHotel(hotel.tempId)}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600"
                                    />

                                    {/* Hotel Photo */}
                                    {hotel.photo_url ? (
                                        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                            <img
                                                src={hotel.photo_url}
                                                alt={hotel.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                        </div>
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-gray-900">
                                                {hotel.name}
                                            </h3>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tierColors[hotel.price_tier]}`}>
                                                {hotel.price_tier}
                                            </span>
                                            {hotel.rating && (
                                                <span className="text-sm text-gray-500">
                                                    ⭐ {hotel.rating} ({hotel.total_ratings} reviews)
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {hotel.address}
                                        </p>
                                        <p className="mt-1 text-sm text-green-600 font-medium">
                                            📍 {hotel.distance_miles} miles away
                                        </p>
                                    </div>
                                    <a
                                        href={hotel.affiliate_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline shrink-0"
                                    >
                                        Preview Link →
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-gray-100 p-4">
                        <div className="text-sm text-gray-600">
                            Select the hotels you want to add to this venue
                        </div>
                        <button
                            onClick={saveSelectedHotels}
                            disabled={saving || selectedHotels.length === 0}
                            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? "Saving..." : `Save ${selectedHotels.length} Hotels`}
                        </button>
                    </div>
                </>
            ) : isSearching ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Searching for hotels...</p>
                </div>
            ) : selectedVenue ? (
                <div className="text-center py-12 text-gray-500">
                    Click "Search Hotels" to find hotels near {selectedVenue.name}
                </div>
            ) : null
            }
        </div >
    );
}