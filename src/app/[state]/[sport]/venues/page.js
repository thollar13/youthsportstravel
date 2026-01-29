"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getStateBySlug, getSportBySlug } from "@/lib/states";
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

function VenueCard({ venue, stateSlug, sportSlug, index }) {
    // Truncate description
    const description = venue.overview
        ? (venue.overview.length > 150 ? venue.overview.slice(0, 150) + "..." : venue.overview)
        : null;

    // Use consistent image based on venue id or index
    const imageIndex = (venue.id || index) % venueImages.length;

    return (
        <Link
            href={`/${stateSlug}/${sportSlug}/venues/${venue.slug || venue.id}`}
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
                    {venue.tournamentCount > 0 && (
                        <span className="inline-block rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                            🏆 {venue.tournamentCount} Events
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
                            {venue.city}
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

                {venue.organizations?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {venue.organizations.slice(0, 3).map((org) => (
                            <span key={org} className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {org}
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
function QuickStats({ venues, stateName }) {
    const stats = useMemo(() => {
        const turfCount = venues.filter(v => v.surface === "turf").length;
        const totalFields = venues.reduce((acc, v) => acc + (v.fields || 0), 0);
        const totalTournaments = venues.reduce((acc, v) => acc + (v.tournamentCount || 0), 0);
        return { turfCount, totalFields, totalTournaments };
    }, [venues]);

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{venues.length}</div>
                <div className="text-sm text-gray-500">Venues</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalFields}</div>
                <div className="text-sm text-gray-500">Total Fields</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.turfCount}</div>
                <div className="text-sm text-gray-500">Turf Venues</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalTournaments}</div>
                <div className="text-sm text-gray-500">Events</div>
            </div>
        </div>
    );
}

export default function VenuesListingPage() {
    const params = useParams();
    const stateSlug = params.state;
    const sportSlug = params.sport;

    const state = getStateBySlug(stateSlug);
    const sport = getSportBySlug(sportSlug);

    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [surfaceFilter, setSurfaceFilter] = useState("");

    useEffect(() => {
        const fetchVenues = async () => {
            if (!state) return;
            try {
                // First fetch all venues
                const venuesRes = await fetch(`${API_URL}/api/venues`);
                const venuesData = await venuesRes.json();

                // Filter venues for this state/sport
                const filtered = (venuesData.venues || []).filter((v) => {
                    const matchesState = v.state?.toUpperCase() === state.code;
                    const matchesSport = v.sports?.includes(sportSlug) || (sportSlug === "baseball" && !v.sports?.length);
                    return matchesState && matchesSport;
                });

                // Set venues immediately so page loads fast
                setVenues(filtered.map(v => ({ ...v, tournamentCount: 0 })));
                setIsLoading(false);

                // Then fetch tournament counts for each venue in parallel
                const venuesWithCounts = await Promise.all(
                    filtered.map(async (v) => {
                        try {
                            const res = await fetch(`${API_URL}/api/venues/${v.id}/tournaments`);
                            const data = await res.json();
                            return {
                                ...v,
                                tournamentCount: data.tournaments?.length || 0
                            };
                        } catch (err) {
                            return { ...v, tournamentCount: 0 };
                        }
                    })
                );

                // Update with counts
                setVenues(venuesWithCounts);
            } catch (error) {
                console.error("Error fetching venues:", error);
                setIsLoading(false);
            }
        };
        fetchVenues();
    }, [state, sportSlug]);

    const filteredVenues = useMemo(() => {
        return venues.filter((venue) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchFields = [venue.name, venue.city, ...(venue.organizations || [])].join(" ").toLowerCase();
                if (!searchFields.includes(query)) return false;
            }
            // Surface filter
            if (surfaceFilter && venue.surface !== surfaceFilter) {
                return false;
            }
            return true;
        });
    }, [venues, searchQuery, surfaceFilter]);

    // Get unique surfaces
    const surfaces = useMemo(() => {
        const uniqueSurfaces = [...new Set(venues.map(v => v.surface).filter(Boolean))];
        return uniqueSurfaces.sort();
    }, [venues]);

    const hasActiveFilters = searchQuery || surfaceFilter;

    const clearAllFilters = () => {
        setSearchQuery("");
        setSurfaceFilter("");
    };

    if (!state || !sport) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Invalid State or Sport</h2>
                        <p className="mt-2 text-gray-500">The page you're looking for doesn't exist.</p>
                        <Link
                            href="/venues"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                        >
                            Browse All Venues
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero Header with background image */}
            <header className="relative overflow-hidden">
                {/* Background image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1920&h=600&fit=crop"
                        alt={`${sport.name} field`}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-700/80" />
                </div>

                <div className="relative px-4 py-16 sm:py-24 sm:px-6 lg:px-8 h-[375px]">
                    <div className="mx-auto max-w-7xl">
                        {/* Breadcrumb */}
                        <nav className="mb-8 flex items-center gap-2 text-sm text-green-200">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <Link href={`/${stateSlug}`} className="hover:text-white transition-colors">{state.name}</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">{sport.name} Venues</span>
                        </nav>

                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                {state.name} {sport.name} Venues
                            </h1>
                            <p className="mt-6 text-xl text-green-100">
                                Find {sport.name.toLowerCase()} tournament venues in {state.name} with hotel recommendations,
                                restaurants, and insider travel tips from families who've been there.
                            </p>

                            {/* Quick links */}
                            {/* <div className="mt-8 flex flex-wrap gap-3">
                                <Link
                                    href={`/${stateSlug}`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                                >
                                    <span>🗺️</span> All {state.name} Sports
                                </Link>
                                <Link
                                    href="/venues"
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-400 transition-colors"
                                >
                                    <span>🏟️</span> All Venues
                                </Link>
                            </div> */}
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-wrap gap-3 items-center">
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
                                            {surface === "turf" ? "🌿 Turf" : "🌱 Grass"}
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
                                Clear filters
                            </button>
                        )}

                        {/* Results count */}
                        <div className="ml-auto text-sm text-gray-500">
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                <>
                                    <span className="font-semibold text-gray-900">{filteredVenues.length}</span>
                                    {" "}venue{filteredVenues.length !== 1 ? "s" : ""}
                                </>
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
                                ? "We couldn't find any venues matching your filters. Try adjusting your search."
                                : `No ${sport.name.toLowerCase()} venues in ${state.name} yet. Check back soon!`
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearAllFilters}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Quick Stats */}
                        {!hasActiveFilters && <QuickStats venues={venues} stateName={state.name} />}

                        {/* Venue Grid */}
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredVenues.map((venue, index) => (
                                <VenueCard
                                    key={venue.id}
                                    venue={venue}
                                    stateSlug={stateSlug}
                                    sportSlug={sportSlug}
                                    index={index}
                                />
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-16 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
                            <h3 className="text-2xl font-bold text-white">
                                Know a {sport.name.toLowerCase()} venue in {state.name} we're missing?
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
                                    href="/venues"
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-800/50 px-6 py-3 text-sm font-semibold text-white hover:bg-green-800/70 transition-colors"
                                >
                                    Browse All Venues
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