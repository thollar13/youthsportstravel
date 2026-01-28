"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const PRICE_TIERS = [
    { value: "budget", label: "Budget-Friendly" },
    { value: "mid", label: "Mid-Range" },
    { value: "upscale", label: "Upscale" },
];

const COMMON_AMENITIES = [
    "Free Breakfast", "Pool", "Free WiFi", "Fitness Center",
    "Kitchen/Kitchenette", "Free Parking", "Pet Friendly",
    "Laundry", "Restaurant", "Room Service",
];

export default function EditHotelPage() {
    const params = useParams();
    const router = useRouter();
    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        venue_id: "",
        name: "",
        address: "",
        distance_miles: "",
        drive_minutes: "",
        price_range: "",
        price_tier: "mid",
        amenities: [],
        why_good: "",
        affiliate_url: "",
        affiliate_provider: "",
        family_friendly: true,
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [hotelRes, venuesRes] = await Promise.all([
                    fetch(`${API_URL}/api/hotels/${params.id}`),
                    fetch(`${API_URL}/api/venues`),
                ]);
                const hotelData = await hotelRes.json();
                const venuesData = await venuesRes.json();

                setVenues(venuesData.venues || []);

                if (hotelData.hotel) {
                    const h = hotelData.hotel;
                    setFormData({
                        venue_id: h.venue_id || "",
                        name: h.name || "",
                        address: h.address || "",
                        distance_miles: h.distance_miles || "",
                        drive_minutes: h.drive_minutes || "",
                        price_range: h.price_range || "",
                        price_tier: h.price_tier || "mid",
                        amenities: h.amenities || [],
                        why_good: h.why_good || "",
                        affiliate_url: h.affiliate_url || "",
                        affiliate_provider: h.affiliate_provider || "",
                        family_friendly: h.family_friendly ?? true,
                    });
                }
            } catch (err) {
                setError("Failed to load hotel");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [params.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/hotels/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    distance_miles: formData.distance_miles ? parseFloat(formData.distance_miles) : null,
                    drive_minutes: formData.drive_minutes ? parseInt(formData.drive_minutes) : null,
                }),
            });

            if (res.ok) {
                router.push("/admin/hotels");
            } else {
                const data = await res.json();
                setError(data.message || "Failed to update hotel");
            }
        } catch (err) {
            setError("Failed to update hotel");
        } finally {
            setSaving(false);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <Link href="/admin/hotels" className="text-sm text-green-600 hover:text-green-700">
                    ← Back to Hotels
                </Link>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Edit Hotel</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                        <select
                            required
                            value={formData.venue_id}
                            onChange={(e) => setFormData({ ...formData, venue_id: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="">Select a venue...</option>
                            {venues.map((v) => (
                                <option key={v.id} value={v.id}>{v.name} ({v.city}, {v.state})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (miles)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.distance_miles}
                                onChange={(e) => setFormData({ ...formData, distance_miles: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Drive Time (min)</label>
                            <input
                                type="number"
                                value={formData.drive_minutes}
                                onChange={(e) => setFormData({ ...formData, drive_minutes: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                            <input
                                type="text"
                                value={formData.price_range}
                                onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                                placeholder="$120-$180/night"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price Tier</label>
                            <select
                                value={formData.price_tier}
                                onChange={(e) => setFormData({ ...formData, price_tier: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                {PRICE_TIERS.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Why We Recommend</label>
                        <textarea
                            value={formData.why_good}
                            onChange={(e) => setFormData({ ...formData, why_good: e.target.value })}
                            rows={2}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_AMENITIES.map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => toggleAmenity(a)}
                                    className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${formData.amenities.includes(a)
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="family_friendly"
                            checked={formData.family_friendly}
                            onChange={(e) => setFormData({ ...formData, family_friendly: e.target.checked })}
                            className="h-4 w-4 rounded border-gray-300 text-green-600"
                        />
                        <label htmlFor="family_friendly" className="text-sm text-gray-700">Family Friendly</label>
                    </div>
                </div>

                {/* Affiliate */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <h2 className="font-semibold text-gray-900">Affiliate Link</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                        <select
                            value={formData.affiliate_provider}
                            onChange={(e) => setFormData({ ...formData, affiliate_provider: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                            <option value="">None</option>
                            <option value="booking">Booking.com</option>
                            <option value="expedia">Expedia</option>
                            <option value="hotelscom">Hotels.com</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate URL</label>
                        <input
                            type="url"
                            value={formData.affiliate_url}
                            onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                            placeholder="https://www.booking.com/..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <Link
                        href="/admin/hotels"
                        className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}