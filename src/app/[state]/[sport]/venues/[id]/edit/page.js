"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getStateBySlug, getSportBySlug } from "@/lib/states";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function EditVenuePage() {
    const router = useRouter();
    const params = useParams();
    const { state: stateSlug, sport: sportSlug, id: venueId } = params;

    const state = getStateBySlug(stateSlug);
    const sport = getSportBySlug(sportSlug);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    // Fetch venue
    useEffect(() => {
        const fetchVenue = async () => {
            try {
                const res = await fetch(`${API_URL}/api/venues/${venueId}`);
                const data = await res.json();

                if (!res.ok) throw new Error(data.message || "Failed to fetch venue");

                const venue = data.venue;
                reset({
                    ...venue,
                    lat: venue.lat || "",
                    lng: venue.lng || "",
                    fields: venue.fields || "",
                    sports_text: Array.isArray(venue.sports) ? venue.sports.join(", ") : "",
                    organizations_text: Array.isArray(venue.organizations) ? venue.organizations.join(", ") : "",
                    notable_events_text: Array.isArray(venue.notable_events) ? venue.notable_events.join(", ") : "",
                    pro_tips_text: Array.isArray(venue.pro_tips) ? venue.pro_tips.join("\n") : "",
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (venueId) fetchVenue();
    }, [venueId, reset]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError(null);

        const payload = {
            ...data,
            lat: data.lat ? parseFloat(data.lat) : null,
            lng: data.lng ? parseFloat(data.lng) : null,
            fields: data.fields ? parseInt(data.fields) : null,
            sports: data.sports_text ? data.sports_text.split(",").map((s) => s.trim()) : [sportSlug],
            organizations: data.organizations_text ? data.organizations_text.split(",").map((s) => s.trim()) : [],
            notable_events: data.notable_events_text ? data.notable_events_text.split(",").map((s) => s.trim()) : [],
            pro_tips: data.pro_tips_text ? data.pro_tips_text.split("\n").filter((s) => s.trim()) : [],
        };

        // Clean up temp fields
        delete payload.sports_text;
        delete payload.organizations_text;
        delete payload.notable_events_text;
        delete payload.pro_tips_text;
        delete payload.created_at;
        delete payload.updated_at;
        delete payload.search_vector;

        try {
            const res = await fetch(`${API_URL}/api/venues/${venueId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to update venue");

            setSuccess(true);
            setTimeout(() => {
                router.push(`/${stateSlug}/${sportSlug}/venues/${venueId}`);
            }, 2000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!state || !sport) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Invalid state or sport</p>
            </main>
        );
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading venue...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 px-4 py-12 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl">
                    <nav className="mb-6 flex items-center gap-2 text-sm text-green-200">
                        <Link href={`/${stateSlug}/${sportSlug}/venues`} className="hover:text-white transition-colors">
                            {state.name} {sport.name} Venues
                        </Link>
                        <span>/</span>
                        <span className="text-white">Edit</span>
                    </nav>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Edit Venue</h1>
                </div>
            </header>

            {/* Form */}
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {success && (
                    <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                        <p className="text-green-800 font-medium">Venue updated! Redirecting...</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
                        <p className="text-red-800 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Info */}
                    <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                                <input {...register("id")} readOnly className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                                <input {...register("slug", { required: "Required" })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug.message}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
                                <input {...register("name", { required: "Required" })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                <input {...register("city", { required: "Required" })} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                                <input {...register("state", { required: "Required", maxLength: 2 })} maxLength={2} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input {...register("address")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input type="number" step="any" {...register("lat")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input type="number" step="any" {...register("lng")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Facility */}
                    <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Facility Details</h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fields</label>
                                <input type="number" {...register("fields")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface</label>
                                <select {...register("surface")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none">
                                    <option value="">Select</option>
                                    <option value="turf">Turf</option>
                                    <option value="grass">Grass</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input type="url" {...register("website")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="tel" {...register("phone")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sports (comma-separated)</label>
                                <input {...register("sports_text")} placeholder="baseball, softball" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organizations (comma-separated)</label>
                                <input {...register("organizations_text")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Content</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                                <textarea rows={4} {...register("overview")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">What to Expect</label>
                                <textarea rows={4} {...register("what_to_expect")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Where to Stay</label>
                                <textarea rows={4} {...register("where_to_stay")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Where to Eat</label>
                                <textarea rows={4} {...register("where_to_eat")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Things to Do</label>
                                <textarea rows={4} {...register("things_to_do")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pro Tips (one per line)</label>
                                <textarea rows={6} {...register("pro_tips_text")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* SEO */}
                    <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                <input {...register("meta_title")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <textarea rows={2} {...register("meta_description")} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none" />
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href={`/${stateSlug}/${sportSlug}/venues/${venueId}`}
                            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </main>
    );
}