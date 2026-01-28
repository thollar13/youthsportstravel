// app/admin/hotels/page.jsx
"use client";

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import AdminGuard from "@/components/AdminGuard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PRICE_TIERS = [
    { value: "budget", label: "Budget-Friendly" },
    { value: "mid", label: "Mid-Range" },
    { value: "upscale", label: "Upscale" },
];

const AFFILIATE_PROVIDERS = [
    { value: "", label: "None / Manual URL" },
    { value: "booking", label: "Booking.com" },
    { value: "expedia", label: "Expedia" },
    { value: "hotelscom", label: "Hotels.com" },
];

const COMMON_AMENITIES = [
    "Free Breakfast",
    "Pool",
    "Free WiFi",
    "Fitness Center",
    "Kitchen/Kitchenette",
    "Free Parking",
    "Pet Friendly",
    "Laundry",
    "Restaurant",
    "Room Service",
];

export default function AdminHotelsPage() {
    const [hotels, setHotels] = useState([]);
    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingHotel, setEditingHotel] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [filterVenue, setFilterVenue] = useState("");

    const emptyHotel = {
        venue_id: "",
        name: "",
        address: "",
        distance_miles: "",
        drive_minutes: "",
        price_range: "",
        price_tier: "mid",
        amenities: [],
        why_good: "",
        booking_url: "",
        affiliate_url: "",
        affiliate_provider: "booking",
        family_friendly: false,
    };

    const [formData, setFormData] = useState(emptyHotel);

    useEffect(() => {
        fetchData();
    }, [filterVenue]);

    const fetchData = async () => {
        try {
            const [hotelsRes, venuesRes] = await Promise.all([
                fetch(`${API_URL}/api/hotels${filterVenue ? `?venue_id=${filterVenue}` : ""}`),
                fetch(`${API_URL}/api/venues`),
            ]);
            const hotelsData = await hotelsRes.json();
            const venuesData = await venuesRes.json();
            setHotels(hotelsData.hotels || []);
            setVenues(venuesData.venues || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingHotel
                ? `${API_URL}/api/hotels/${editingHotel.id}`
                : `${API_URL}/api/hotels`;
            const method = editingHotel ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    venue_id: formData.venue_id || null,
                    distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
                    drive_minutes: formData.drive_minutes ? parseInt(formData.drive_minutes) : null,
                }),
            });

            if (res.ok) {
                fetchData();
                setShowForm(false);
                setEditingHotel(null);
                setFormData(emptyHotel);
            }
        } catch (error) {
            console.error("Error saving hotel:", error);
        }
    };

    const handleEdit = (hotel) => {
        setEditingHotel(hotel);

        // Ensure amenities is always an array
        let amenitiesArray = [];
        if (Array.isArray(hotel.amenities)) {
            amenitiesArray = hotel.amenities;
        } else if (typeof hotel.amenities === 'string' && hotel.amenities) {
            // Handle comma-separated string from database
            amenitiesArray = hotel.amenities.split(',').map(a => a.trim());
        }

        setFormData({
            venue_id: hotel.venue_id || "",
            name: hotel.name || "",
            address: hotel.address || "",
            distance_miles: hotel.distance_miles || "",
            drive_minutes: hotel.drive_minutes || "",
            price_range: hotel.price_range || "",
            price_tier: hotel.price_tier || "mid",
            amenities: amenitiesArray,
            why_good: hotel.why_good || "",
            booking_url: hotel.booking_url || "",
            affiliate_url: hotel.affiliate_url || "",
            affiliate_provider: hotel.affiliate_provider || "",
            family_friendly: hotel.family_friendly || false,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this hotel?")) return;
        try {
            await fetch(`${API_URL}/api/hotels/${id}`, { method: "DELETE" });
            fetchData();
        } catch (error) {
            console.error("Error deleting hotel:", error);
        }
    };

    const toggleAmenity = (amenity) => {
        setFormData((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const generateAffiliateUrl = () => {
        if (!formData.name || !formData.affiliate_provider) return;

        const venue = venues.find(v => v.id === formData.venue_id);
        const city = venue?.city || "";
        const searchQuery = `${formData.name} ${city}`.trim();

        let url = "";
        switch (formData.affiliate_provider) {
            case "booking":
                url = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(searchQuery)}&aid=YOUR_BOOKING_ID`;
                break;
            case "expedia":
                url = `https://www.expedia.com/Hotel-Search?destination=${encodeURIComponent(searchQuery)}`;
                break;
            case "hotelscom":
                url = `https://www.hotels.com/search.do?q-destination=${encodeURIComponent(searchQuery)}`;
                break;
        }

        setFormData(prev => ({ ...prev, affiliate_url: url }));
    };

    return (

        <main className="min-h-screen bg-gray-50">
            <Navigation />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Hotels</h1>
                    <button
                        onClick={() => {
                            setEditingHotel(null);
                            setFormData(emptyHotel);
                            setShowForm(true);
                        }}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                    >
                        + Add Hotel
                    </button>
                </div>

                {/* Filter by Venue */}
                <div className="mb-6">
                    <select
                        value={filterVenue}
                        onChange={(e) => setFilterVenue(e.target.value)}
                        className="rounded-lg border border-gray-300 px-4 py-2"
                    >
                        <option value="">All Venues</option>
                        {venues.map((v) => (
                            <option key={v.id} value={v.id}>
                                {v.name} ({v.city})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="text-xl font-bold mb-6">
                                {editingHotel ? "Edit Hotel" : "Add New Hotel"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Venue Select */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Venue *
                                    </label>
                                    <select
                                        required
                                        value={formData.venue_id}
                                        onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    >
                                        <option value="">Select a venue...</option>
                                        {venues.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.name} ({v.city}, {v.state})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Hotel Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hotel Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Hampton Inn Viera"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="123 Main St, Viera, FL 32955"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                {/* Distance & Drive Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Distance (miles)
                                        </label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.distance_miles}
                                            onChange={(e) => setFormData({ ...formData, distance_miles: e.target.value })}
                                            placeholder="2.5"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Drive Time (min)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.drive_minutes}
                                            onChange={(e) => setFormData({ ...formData, drive_minutes: e.target.value })}
                                            placeholder="5"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                </div>

                                {/* Price Range & Tier */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price Range
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.price_range}
                                            onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                                            placeholder="$120-$180/night"
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Price Tier
                                        </label>
                                        <select
                                            value={formData.price_tier}
                                            onChange={(e) => setFormData({ ...formData, price_tier: e.target.value })}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        >
                                            {PRICE_TIERS.map((tier) => (
                                                <option key={tier.value} value={tier.value}>
                                                    {tier.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Why Good */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Why We Recommend
                                    </label>
                                    <textarea
                                        value={formData.why_good}
                                        onChange={(e) => setFormData({ ...formData, why_good: e.target.value })}
                                        placeholder="Closest hotel to the venue, great breakfast, team-friendly..."
                                        rows={2}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>

                                {/* Amenities */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amenities
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {COMMON_AMENITIES.map((amenity) => (
                                            <button
                                                key={amenity}
                                                type="button"
                                                onClick={() => toggleAmenity(amenity)}
                                                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${formData.amenities.includes(amenity)
                                                    ? "bg-green-600 text-white"
                                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                    }`}
                                            >
                                                {amenity}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Family Friendly */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="family_friendly"
                                        checked={formData.family_friendly}
                                        onChange={(e) => setFormData({ ...formData, family_friendly: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-green-600"
                                    />
                                    <label htmlFor="family_friendly" className="text-sm text-gray-700">
                                        Family Friendly
                                    </label>
                                </div>

                                {/* Affiliate Section */}
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="font-semibold text-gray-900 mb-3">Affiliate Link</h3>

                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Provider
                                            </label>
                                            <select
                                                value={formData.affiliate_provider}
                                                onChange={(e) => setFormData({ ...formData, affiliate_provider: e.target.value })}
                                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                            >
                                                {AFFILIATE_PROVIDERS.map((p) => (
                                                    <option key={p.value} value={p.value}>
                                                        {p.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={generateAffiliateUrl}
                                                className="w-full rounded-lg border border-green-600 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                                            >
                                                Generate URL
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Affiliate URL
                                        </label>
                                        <input
                                            type="url"
                                            value={formData.affiliate_url}
                                            onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                                            placeholder="https://www.booking.com/..."
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            This URL will be used for the "Check Availability" button
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingHotel(null);
                                        }}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                                    >
                                        {editingHotel ? "Save Changes" : "Add Hotel"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Hotels List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
                    </div>
                ) : hotels.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No hotels found. Add your first hotel!
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Hotel</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Venue</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Affiliate</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {hotels.map((hotel) => (
                                    <tr key={hotel.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900">{hotel.name}</div>
                                            {hotel.distance_miles && (
                                                <div className="text-sm text-gray-500">
                                                    {hotel.distance_miles} mi away
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {hotel.venue_name || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${hotel.price_tier === "budget" ? "bg-green-100 text-green-700" :
                                                hotel.price_tier === "upscale" ? "bg-purple-100 text-purple-700" :
                                                    "bg-blue-100 text-blue-700"
                                                }`}>
                                                {hotel.price_tier || "mid"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {hotel.affiliate_url ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                                                    ✓ {hotel.affiliate_provider || "Custom"}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm">None</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => handleEdit(hotel)}
                                                className="text-sm text-green-600 hover:text-green-700 mr-3"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(hotel.id)}
                                                className="text-sm text-red-600 hover:text-red-700"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>

    );
}