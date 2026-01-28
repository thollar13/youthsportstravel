"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAllStates, getAllSports, getStateByCode } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Placeholder images for venue cards
const venueImages = [
    "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=600&h=400&fit=crop",
];

function VenueCard({ venue, index }) {
    const stateSlug = getStateByCode(venue.state)?.slug || venue.state.toLowerCase();
    const sportSlug = venue.sports?.[0] || "baseball";

    const description = venue.overview
        ? (venue.overview.length > 150 ? venue.overview.slice(0, 150) + "..." : venue.overview)
        : null;

    // Use consistent image based on venue id or index
    const imageIndex = (venue.id || index) % venueImages.length;

    return (
        <Link
            href={`/${stateSlug}/${sportSlug}/venues/${venue.slug}`}
            className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-green-300"
        >
            {/* Image header */}
            <div className="relative h-44 overflow-hidden">
                <img
                    src={venueImages[imageIndex]}
                    alt={venue.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
                    {venue.fields && (
                        <span className="inline-block rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                            ⚾ {venue.fields} Fields
                        </span>
                    )}
                    {venue.surface && (
                        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${venue.surface === "turf"
                            ? "bg-emerald-500 text-white"
                            : "bg-green-600 text-white"
                            }`}>
                            {venue.surface === "turf" ? "🌿 Turf" : "🌱 Grass"}
                        </span>
                    )}
                </div>

                {/* Bottom overlay content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {venue.city}, {venue.state}
                        </span>
                        {venue.hotel_count > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white">
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
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
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
                                {/* {sport === "baseball" ? "⚾" : "🥎"}  */}
                                {sport}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex items-center text-sm font-semibold text-green-600 group-hover:text-green-700">
                    View Travel Guide
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        </Link>
    );
}

// Quick stats component
function QuickStats({ venues }) {
    const stats = useMemo(() => {
        const uniqueStates = new Set(venues.map(v => v.state)).size;
        const turfCount = venues.filter(v => v.surface === "turf").length;
        const totalFields = venues.reduce((acc, v) => acc + (v.fields || 0), 0);
        return { uniqueStates, turfCount, totalFields };
    }, [venues]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{venues.length}</div>
                <div className="text-sm text-gray-500">Total Venues</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.uniqueStates}</div>
                <div className="text-sm text-gray-500">States</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalFields}</div>
                <div className="text-sm text-gray-500">Total Fields</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.turfCount}</div>
                <div className="text-sm text-gray-500">Turf Venues</div>
            </div>
        </div>
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

    const clearAllFilters = () => {
        setSearchQuery("");
        setSurfaceFilter("");
        router.push("/venues", { scroll: false });
    };

    const hasActiveFilters = stateFilter || sportFilter || searchQuery || surfaceFilter;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero Header with background image */}
            <header className="relative overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=600&fit=crop"
                        alt="Baseball stadium"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-700/85" />
                </div>

                <div className="relative px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Breadcrumb */}
                        <nav className="mb-6 flex items-center gap-2 text-sm text-green-200">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">Venues</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-5xl">🏟️</span>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                        Tournament Venues
                                    </h1>
                                </div>
                                <p className="max-w-2xl text-lg text-green-100">
                                    Find tournament venues across the country with hotel recommendations,
                                    restaurants, and insider tips for tournament families.
                                </p>
                            </div>

                            {/* Quick action buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="#popular"
                                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                                >
                                    <span>🔥</span> Popular Venues
                                </Link>
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-400 transition-colors"
                                >
                                    <span>➕</span> Suggest Venue
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4">
                        {/* Primary filters row */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* State filter */}
                            <div className="relative">
                                <select
                                    value={stateFilter}
                                    onChange={(e) => updateFilters(e.target.value, sportFilter)}
                                    className="appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                >
                                    <option value="">All States</option>
                                    {states.map(state => (
                                        <option key={state.code} value={state.code}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Sport filter */}
                            <div className="relative">
                                <select
                                    value={sportFilter}
                                    onChange={(e) => updateFilters(stateFilter, e.target.value)}
                                    className="appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                >
                                    <option value="">All Sports</option>
                                    {sports.map(sport => (
                                        <option key={sport.id} value={sport.id}>
                                            {sport.icon} {sport.name}
                                        </option>
                                    ))}
                                </select>
                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {/* Surface filter */}
                            {surfaces.length > 0 && (
                                <div className="relative">
                                    <select
                                        value={surfaceFilter}
                                        onChange={(e) => setSurfaceFilter(e.target.value)}
                                        className="appearance-none rounded-lg border border-gray-300 bg-white pl-4 pr-10 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    >
                                        <option value="">All Surfaces</option>
                                        {surfaces.map(surface => (
                                            <option key={surface} value={surface}>
                                                {surface === "turf" ? "Turf" : "Grass"}
                                            </option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
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
                                    className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Clear filters */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Results count and active filters */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="text-sm text-gray-500">
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading venues...
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-semibold text-gray-900">{filteredVenues.length}</span>
                                        {" "}venue{filteredVenues.length !== 1 ? "s" : ""}
                                        {stateFilter && (
                                            <> in <span className="font-medium text-green-600">{states.find(s => s.code === stateFilter)?.name}</span></>
                                        )}
                                        {sportFilter && (
                                            <> for <span className="font-medium text-green-600 capitalize">{sportFilter}</span></>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Active filter pills */}
                            {hasActiveFilters && (
                                <div className="flex flex-wrap gap-2">
                                    {stateFilter && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            {states.find(s => s.code === stateFilter)?.name}
                                            <button onClick={() => updateFilters("", sportFilter)} className="hover:text-green-900">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    )}
                                    {sportFilter && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 capitalize">
                                            {sportFilter}
                                            <button onClick={() => updateFilters(stateFilter, "")} className="hover:text-green-900">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    )}
                                    {surfaceFilter && (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 capitalize">
                                            {surfaceFilter}
                                            <button onClick={() => setSurfaceFilter("")} className="hover:text-green-900">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading venues...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Unable to load venues</h3>
                        <p className="mt-2 text-gray-600">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Try again
                        </button>
                    </div>
                ) : filteredVenues.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No venues found</h3>
                        <p className="mt-2 text-gray-500 max-w-md mx-auto">
                            {hasActiveFilters
                                ? "We couldn't find any venues matching your filters. Try adjusting your search criteria."
                                : "No venues available yet. Check back soon!"
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Quick Stats */}
                        {!hasActiveFilters && <QuickStats venues={venues} />}

                        {/* Venue Grid */}
                        <div id="popular" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredVenues.map((venue, index) => (
                                <VenueCard key={venue.id} venue={venue} index={index} />
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-16 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
                            <h3 className="text-2xl font-bold text-white">
                                Know a venue we're missing?
                            </h3>
                            <p className="mt-3 text-green-100 max-w-xl mx-auto">
                                Help us build the most complete guide for tournament families. We're always looking to add new venues.
                            </p>
                            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/contact"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Suggest a Venue
                                </Link>
                                <Link
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-800/50 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800/70 transition-colors"
                                >
                                    Browse by State
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