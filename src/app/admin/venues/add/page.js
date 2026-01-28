"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const SURFACE_OPTIONS = ["turf", "grass", "dirt", "mixed"];
const ORGANIZATION_OPTIONS = ["USSSA", "Perfect Game", "Travel Ball", "Little League", "Pony", "AAU"];

export default function AddVenuePage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        city: "",
        state: "",
        address: "",
        fields: "",
        surface: "",
        lat: "",
        lng: "",
        website: "",
        phone: "",
        sports_text: "baseball",
        organizations_text: "",
        notable_events_text: "",
        overview: "",
        what_to_expect: "",
        where_to_stay: "",
        where_to_eat: "",
        things_to_do: "",
        pro_tips: [""],
        meta_title: "",
        meta_description: "",
    });

    const generateSlug = () => {
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
        setFormData({ ...formData, slug });
    };

    const geocodeAddress = async () => {
        const { address, city, state } = formData;

        if (!city || !state) {
            setError("Please enter city and state first");
            return;
        }

        setGeocoding(true);
        setError("");

        const query = [address, city, state, "USA"].filter(Boolean).join(", ");

        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
                { headers: { "User-Agent": "TournamentTravelGuide" } }
            );
            const data = await res.json();

            if (data && data.length > 0) {
                setFormData({
                    ...formData,
                    lat: data[0].lat,
                    lng: data[0].lon,
                });
            } else {
                setError("Could not find coordinates. Try adding more address details.");
            }
        } catch (err) {
            setError("Failed to get coordinates");
        } finally {
            setGeocoding(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const payload = {
            name: formData.name,
            slug: formData.slug,
            city: formData.city,
            state: formData.state,
            address: formData.address || null,
            fields: formData.fields ? parseInt(formData.fields) : null,
            surface: formData.surface || null,
            lat: formData.lat ? parseFloat(formData.lat) : null,
            lng: formData.lng ? parseFloat(formData.lng) : null,
            website: formData.website || null,
            phone: formData.phone || null,
            sports: formData.sports_text ? formData.sports_text.split(",").map(s => s.trim()).filter(Boolean) : [],
            organizations: formData.organizations_text ? formData.organizations_text.split(",").map(s => s.trim()).filter(Boolean) : [],
            notable_events: formData.notable_events_text ? formData.notable_events_text.split(",").map(s => s.trim()).filter(Boolean) : [],
            overview: formData.overview || null,
            what_to_expect: formData.what_to_expect || null,
            where_to_stay: formData.where_to_stay || null,
            where_to_eat: formData.where_to_eat || null,
            things_to_do: formData.things_to_do || null,
            pro_tips: formData.pro_tips.filter(tip => tip.trim()),
            meta_title: formData.meta_title || null,
            meta_description: formData.meta_description || null,
        };

        try {
            const res = await fetch(`${API_URL}/api/venues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push("/admin/venues");
            } else {
                const data = await res.json();
                setError(data.message || "Failed to create venue");
            }
        } catch (err) {
            setError("Failed to create venue");
        } finally {
            setSaving(false);
        }
    };

    const updateProTip = (index, value) => {
        setFormData((prev) => ({
            ...prev,
            pro_tips: prev.pro_tips.map((tip, i) => (i === index ? value : tip)),
        }));
    };

    const addProTip = () => {
        setFormData((prev) => ({
            ...prev,
            pro_tips: [...prev.pro_tips, ""],
        }));
    };

    const removeProTip = (index) => {
        setFormData((prev) => ({
            ...prev,
            pro_tips: prev.pro_tips.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <Link href="/admin/venues" className="text-sm text-green-600 hover:text-green-700">
                    ← Back to Venues
                </Link>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">Add Venue</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="USSSA Space Coast Complex"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="usssa-space-coast-complex"
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                                />
                                <button
                                    type="button"
                                    onClick={generateSlug}
                                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                    Generate
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                            <input
                                type="text"
                                required
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Viera"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                            <input
                                type="text"
                                required
                                maxLength={2}
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                                placeholder="FL"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="5800 Stadium Pkwy, Viera, FL 32940"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Fields</label>
                            <input
                                type="number"
                                value={formData.fields}
                                onChange={(e) => setFormData({ ...formData, fields: e.target.value })}
                                placeholder="8"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Surface Type</label>
                            <select
                                value={formData.surface}
                                onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            >
                                <option value="">Select surface...</option>
                                {SURFACE_OPTIONS.map((s) => (
                                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="https://..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(321) 555-0100"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        {/* Coordinates with Get Coordinates button */}
                        <div className="sm:col-span-2 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">Coordinates</label>
                                <button
                                    type="button"
                                    onClick={geocodeAddress}
                                    disabled={geocoding}
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {geocoding ? "Finding..." : "📍 Get Coordinates"}
                                </button>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        value={formData.lat}
                                        onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                                        placeholder="28.2558"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        value={formData.lng}
                                        onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                                        placeholder="-80.7401"
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                    />
                                </div>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Fill in city/state/address above, then click "Get Coordinates" to auto-fill
                            </p>
                        </div>
                    </div>
                </div>

                {/* Facility Details */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Facility Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sports (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.sports_text}
                                onChange={(e) => setFormData({ ...formData, sports_text: e.target.value })}
                                placeholder="baseball, softball"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Organizations (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.organizations_text}
                                onChange={(e) => setFormData({ ...formData, organizations_text: e.target.value })}
                                placeholder="USSSA, Perfect Game"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                            <div className="mt-2 flex flex-wrap gap-2">
                                {ORGANIZATION_OPTIONS.map((org) => (
                                    <button
                                        key={org}
                                        type="button"
                                        onClick={() => {
                                            const current = formData.organizations_text
                                                .split(",")
                                                .map(s => s.trim())
                                                .filter(Boolean);
                                            if (current.includes(org)) {
                                                setFormData({
                                                    ...formData,
                                                    organizations_text: current.filter(o => o !== org).join(", ")
                                                });
                                            } else {
                                                setFormData({
                                                    ...formData,
                                                    organizations_text: [...current, org].join(", ")
                                                });
                                            }
                                        }}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${formData.organizations_text.split(",").map(s => s.trim()).includes(org)
                                            ? "bg-green-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            }`}
                                    >
                                        {org}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notable Events (comma-separated)
                            </label>
                            <input
                                type="text"
                                value={formData.notable_events_text}
                                onChange={(e) => setFormData({ ...formData, notable_events_text: e.target.value })}
                                placeholder="World Series, State Championship"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                            <textarea
                                value={formData.overview}
                                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                                rows={4}
                                placeholder="Describe the venue..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">What to Expect</label>
                            <textarea
                                value={formData.what_to_expect}
                                onChange={(e) => setFormData({ ...formData, what_to_expect: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Where to Stay</label>
                            <textarea
                                value={formData.where_to_stay}
                                onChange={(e) => setFormData({ ...formData, where_to_stay: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Where to Eat</label>
                            <textarea
                                value={formData.where_to_eat}
                                onChange={(e) => setFormData({ ...formData, where_to_eat: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Things to Do</label>
                            <textarea
                                value={formData.things_to_do}
                                onChange={(e) => setFormData({ ...formData, things_to_do: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>
                    </div>
                </div>

                {/* Pro Tips */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Pro Tips</h2>

                    <div className="space-y-3">
                        {formData.pro_tips.map((tip, index) => (
                            <div key={index} className="flex gap-2">
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-600">
                                    {index + 1}
                                </span>
                                <input
                                    type="text"
                                    value={tip}
                                    onChange={(e) => updateProTip(index, e.target.value)}
                                    placeholder="Enter a pro tip..."
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                                />
                                {formData.pro_tips.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeProTip(index)}
                                        className="text-red-500 hover:text-red-700 px-2"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={addProTip}
                        className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                        + Add Another Tip
                    </button>
                </div>

                {/* SEO */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                            <input
                                type="text"
                                value={formData.meta_title}
                                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                            <textarea
                                value={formData.meta_description}
                                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                            />
                        </div>
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
                        {saving ? "Saving..." : "Create Venue"}
                    </button>
                    <Link
                        href="/admin/venues"
                        className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}