"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { getStateBySlug, getSportBySlug } from "@/lib/states";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AddVenuePage() {
    const router = useRouter();
    const params = useParams();
    const { state: stateSlug, sport: sportSlug } = params;

    const state = getStateBySlug(stateSlug);
    const sport = getSportBySlug(sportSlug);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            state: state?.code || "",
            sports_text: sport?.slug || "baseball",
        },
    });

    const watchName = watch("name");

    // Auto-generate slug from name
    useEffect(() => {
        if (watchName) {
            const slug = watchName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            setValue("slug", slug);
            setValue("id", slug);
        }
    }, [watchName, setValue]);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError(null);

        const payload = {
            id: data.id || data.slug,
            name: data.name,
            slug: data.slug,
            city: data.city,
            state: data.state?.toUpperCase(),
            address: data.address || null,
            lat: data.lat ? parseFloat(data.lat) : null,
            lng: data.lng ? parseFloat(data.lng) : null,
            fields: data.fields ? parseInt(data.fields) : null,
            surface: data.surface || null,
            sports: data.sports_text ? data.sports_text.split(",").map((s) => s.trim()) : [sportSlug],
            organizations: data.organizations_text ? data.organizations_text.split(",").map((s) => s.trim()) : [],
            notable_events: data.notable_events_text ? data.notable_events_text.split(",").map((s) => s.trim()) : [],
            website: data.website || null,
            phone: data.phone || null,
            overview: data.overview || null,
            what_to_expect: data.what_to_expect || null,
            where_to_stay: data.where_to_stay || null,
            where_to_eat: data.where_to_eat || null,
            things_to_do: data.things_to_do || null,
            pro_tips: data.pro_tips_text ? data.pro_tips_text.split("\n").filter((s) => s.trim()) : [],
            meta_title: data.meta_title || null,
            meta_description: data.meta_description || null,
        };

        try {
            const res = await fetch(`${API_URL}/api/venues`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Failed to create venue");

            setSuccess(true);
            setTimeout(() => {
                router.push(`/${stateSlug}/${sportSlug}/venues/${payload.slug}`);
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
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Invalid State or Sport</h1>
                    <Link href="/" className="mt-4 text-green-600 hover:text-green-700">
                        Go Home
                    </Link>
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
                        <span className="text-white">Add New</span>
                    </nav>
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Add {sport.name} Venue in {state.name}
                    </h1>
                    <p className="mt-2 text-green-100">Help other families by adding a venue you've visited</p>
                </div>
            </header>

            {/* Form */}
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                {success && (
                    <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
                        <p className="text-green-800 font-medium">Venue created! Redirecting...</p>
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
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Venue Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("name", { required: "Venue name is required" })}
                                    placeholder="USSSA Space Coast Complex"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ID (auto-generated)</label>
                                <input
                                    {...register("id")}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated)</label>
                                <input
                                    {...register("slug", { required: "Slug is required" })}
                                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("city", { required: "City is required" })}
                                    placeholder="Melbourne"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                                {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register("state", { required: "State is required", maxLength: 2 })}
                                    maxLength={2}
                                    placeholder={state.code}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 uppercase focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                                {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input
                                    {...register("address")}
                                    placeholder="5800 Stadium Parkway"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    {...register("lat")}
                                    placeholder="28.0836"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    {...register("lng")}
                                    placeholder="-80.6081"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Facility */}
                    <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Facility Details</h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Fields</label>
                                <input
                                    type="number"
                                    {...register("fields")}
                                    placeholder="8"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Surface Type</label>
                                <select
                                    {...register("surface")}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                >
                                    <option value="">Select surface</option>
                                    <option value="turf">Turf</option>
                                    <option value="grass">Grass</option>
                                    <option value="mixed">Mixed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    type="url"
                                    {...register("website")}
                                    placeholder="https://www.usssa.com"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    {...register("phone")}
                                    placeholder="321-555-0100"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sports (comma-separated)</label>
                                <input
                                    {...register("sports_text")}
                                    placeholder="baseball, softball"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Organizations (comma-separated)</label>
                                <input
                                    {...register("organizations_text")}
                                    placeholder="USSSA, Perfect Game, PBR"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Content</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
                                <textarea
                                    rows={4}
                                    {...register("overview")}
                                    placeholder="Brief description of the venue..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">What to Expect</label>
                                <textarea
                                    rows={4}
                                    {...register("what_to_expect")}
                                    placeholder="What families should know about playing here..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Where to Eat</label>
                                <textarea
                                    rows={4}
                                    {...register("where_to_eat")}
                                    placeholder="Recommended restaurants near the venue..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Things to Do</label>
                                <textarea
                                    rows={4}
                                    {...register("things_to_do")}
                                    placeholder="Activities for families between games..."
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Pro Tips (one per line)</label>
                                <textarea
                                    rows={6}
                                    {...register("pro_tips_text")}
                                    placeholder="Arrive early for parking&#10;Bring sunscreen&#10;Pack your own snacks"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* SEO */}
                    <section className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">SEO (Optional)</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                                <input
                                    {...register("meta_title")}
                                    placeholder="Auto-generated if left blank"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                                <textarea
                                    rows={2}
                                    {...register("meta_description")}
                                    placeholder="Auto-generated if left blank"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            href={`/${stateSlug}/${sportSlug}/venues`}
                            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Creating..." : "Create Venue"}
                        </button>
                    </div>
                </form>
            </div>
            <Footer />
        </main>
    );
}