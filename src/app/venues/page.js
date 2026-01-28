"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAllStates, getAllSports, getStateByCode } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function VenueCard({ venue }) {
    const stateSlug = getStateByCode(venue.state)?.slug || venue.state.toLowerCase();
    const sportSlug = venue.sports?.[0] || "baseball";

    const description = venue.overview
        ? (venue.overview.length > 200 ? venue.overview.slice(0, 200) + "..." : venue.overview)
        : null;

    return (
        <Link
            href={`/${stateSlug}/${sportSlug}/venues/${venue.slug}`}
            className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-green-300"
        >
            {/* Header with gradient */}
            <div className={`relative h-36 ${venue.surface === "turf"
                ? "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500"
                : "bg-gradient-to-br from-green-700 via-green-600 to-green-500"
                }`}>
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                    {/* Top badges */}
                    <div className="flex flex-wrap gap-2">
                        {venue.fields && (
                            <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                {venue.fields} Fields
                            </span>
                        )}
                        {venue.surface && (
                            <span className="inline-block rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm capitalize">
                                {venue.surface}
                            </span>
                        )}
                    </div>

                    {/* Bottom: Location */}
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-sm font-medium text-white backdrop-blur-sm">
                            📍 {venue.city}, {venue.state}
                        </span>
                        {venue.hotel_count > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                🏨 {venue.hotel_count} Hotels
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2">
                    {venue.name}
                </h2>

                {description && (
                    <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                        {description}
                    </p>
                )}

                {/* Sports tags */}
                {venue.sports?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {venue.sports.map((sport) => (
                            <span
                                key={sport}
                                className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 capitalize"
                            >
                                {sport}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex items-center text-sm font-semibold text-green-600 group-hover:text-green-700">
                    View Guide
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

export default function VenuesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get filter values from URL
    const stateFilter = searchParams.get("state") || "";
    const sportFilter = searchParams.get("sport") || "";

    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [surfaceFilter, setSurfaceFilter] = useState("");

    const states = getAllStates();
    const sports = getAllSports();

    // Update URL when filters change
    const updateFilters = (newState, newSport) => {
        const params = new URLSearchParams();
        if (newState) params.set("state", newState);
        if (newSport) params.set("sport", newSport);

        const queryString = params.toString();
        router.push(queryString ? `/venues?${queryString}` : "/venues", { scroll: false });
    };

    useEffect(() => {
        const fetchVenues = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // Build query params for API
                const params = new URLSearchParams();
                if (stateFilter) params.set("state", stateFilter);
                if (sportFilter) params.set("sport", sportFilter);

                const res = await fetch(`${API_URL}/api/venues?${params}`);

                if (!res.ok) {
                    throw new Error("Failed to fetch venues");
                }

                const data = await res.json();
                setVenues(data.venues || []);
            } catch (err) {
                console.error("Error fetching venues:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVenues();
    }, [stateFilter, sportFilter]);

    // Client-side filtering for search and surface
    const filteredVenues = useMemo(() => {
        return venues.filter((venue) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchFields = [
                    venue.name,
                    venue.city,
                    venue.overview
                ].filter(Boolean).join(" ").toLowerCase();

                if (!searchFields.includes(query)) return false;
            }

            // Surface filter
            if (surfaceFilter && venue.surface !== surfaceFilter) {
                return false;
            }

            return true;
        });
    }, [venues, searchQuery, surfaceFilter]);

    // Get unique surfaces for filter dropdown
    const surfaces = useMemo(() => {
        const uniqueSurfaces = [...new Set(venues.map(v => v.surface).filter(Boolean))];
        return uniqueSurfaces.sort();
    }, [venues]);

    // Get unique states that have venues (for showing counts)
    const statesWithVenues = useMemo(() => {
        const stateCounts = {};
        venues.forEach(v => {
            stateCounts[v.state] = (stateCounts[v.state] || 0) + 1;
        });
        return stateCounts;
    }, [venues]);

    const clearAllFilters = () => {
        setSearchQuery("");
        setSurfaceFilter("");
        router.push("/venues", { scroll: false });
    };

    const hasActiveFilters = stateFilter || sportFilter || searchQuery || surfaceFilter;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Header */}
            <header className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 px-4 py-12 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Breadcrumb */}
                    <nav className="mb-6 flex items-center gap-2 text-sm text-green-200">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white font-medium">Venues</span>
                    </nav>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">🏟️</span>
                        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                            Tournament Venues
                        </h1>
                    </div>

                    <p className="mt-4 max-w-2xl text-lg text-green-100">
                        Find tournament venues across the country with hotel recommendations,
                        restaurants, and insider tips for tournament families.
                    </p>
                </div>
            </header>

            {/* Filters */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4">
                        {/* Primary filters row */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* State filter */}
                            <select
                                value={stateFilter}
                                onChange={(e) => updateFilters(e.target.value, sportFilter)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            >
                                <option value="">All States</option>
                                {states.map(state => (
                                    <option key={state.code} value={state.code}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>

                            {/* Sport filter */}
                            <select
                                value={sportFilter}
                                onChange={(e) => updateFilters(stateFilter, e.target.value)}
                                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                            >
                                <option value="">All Sports</option>
                                {sports.map(sport => (
                                    <option key={sport.id} value={sport.id}>
                                        {sport.icon} {sport.name}
                                    </option>
                                ))}
                            </select>

                            {/* Surface filter */}
                            {surfaces.length > 0 && (
                                <select
                                    value={surfaceFilter}
                                    onChange={(e) => setSurfaceFilter(e.target.value)}
                                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                >
                                    <option value="">All Surfaces</option>
                                    {surfaces.map(surface => (
                                        <option key={surface} value={surface}>
                                            {surface.charAt(0).toUpperCase() + surface.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            )}

                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search venues..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            {/* Clear filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Results count */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                {isLoading ? (
                                    "Loading..."
                                ) : (
                                    <>
                                        <span className="font-medium text-gray-900">{filteredVenues.length}</span>
                                        {" "}venue{filteredVenues.length !== 1 ? "s" : ""}
                                        {stateFilter && (
                                            <> in <span className="font-medium">{states.find(s => s.code === stateFilter)?.name}</span></>
                                        )}
                                        {sportFilter && (
                                            <> for <span className="font-medium capitalize">{sportFilter}</span></>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading venues...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-gray-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 text-green-600 hover:text-green-700 font-medium"
                        >
                            Try again
                        </button>
                    </div>
                ) : filteredVenues.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">No venues found</h3>
                        <p className="mt-2 text-gray-500">
                            {hasActiveFilters
                                ? "Try adjusting your filters."
                                : "No venues available yet."
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Venue Grid */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredVenues.map((venue) => (
                                <VenueCard key={venue.id} venue={venue} />
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-12 text-center">
                            <div className="inline-block rounded-xl bg-green-50 border border-green-100 px-8 py-6">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Know a venue we're missing?
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Help us build the most complete guide for tournament families.
                                </p>
                                <Link
                                    href="/contact"
                                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                                >
                                    Suggest a Venue
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </main>
    );
}