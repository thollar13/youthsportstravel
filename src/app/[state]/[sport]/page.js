"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { STATES } from "@/lib/states";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Placeholder images for venue cards
const venueImages = [
    "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=400&h=300&fit=crop",
];

const STATE_SLUG_TO_CODE = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new-hampshire': 'NH', 'new-jersey': 'NJ', 'new-mexico': 'NM', 'new-york': 'NY',
    'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
    'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west-virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY'
};

// Venue Card with image
function VenueCard({ venue, stateSlug, sport, index }) {
    const imageIndex = (venue.id || index) % venueImages.length;

    return (
        <Link
            href={`/${stateSlug}/${sport}/venues/${venue.slug || venue.id}`}
            className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-green-300 transition-all duration-300"
        >
            <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="relative h-40 sm:h-auto sm:w-48 flex-shrink-0 overflow-hidden">
                    <img
                        src={venueImages[imageIndex]}
                        alt={venue.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r" />

                    {/* Surface badge */}
                    {venue.surface && (
                        <div className="absolute top-3 left-3">
                            <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${venue.surface === "turf"
                                ? "bg-emerald-500 text-white"
                                : "bg-green-600 text-white"
                                }`}>
                                {venue.surface === "turf" ? "🌿 Turf" : "🌱 Grass"}
                            </span>
                        </div>
                    )}

                    {/* Mobile-only location */}
                    <div className="absolute bottom-3 left-3 sm:hidden">
                        <span className="text-sm font-medium text-white">
                            📍 {venue.city}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-green-700 transition-colors">
                            {venue.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="hidden sm:inline-flex items-center gap-1 text-sm text-gray-500">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {venue.city}, {venue.state}
                            </span>
                            {venue.fields && (
                                <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                    ⚾ {venue.fields} Fields
                                </span>
                            )}
                        </div>

                        {venue.organizations?.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {venue.organizations.slice(0, 3).map((org) => (
                                    <span
                                        key={org}
                                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${org === "Perfect Game"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-orange-100 text-orange-800"
                                            }`}
                                    >
                                        {org}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex items-center text-sm font-semibold text-green-600 group-hover:text-green-700">
                        View Travel Guide
                        <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Quick Stats Component
function QuickStats({ venueCount, turfCount, totalFields }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{venueCount}</div>
                <div className="text-sm text-gray-500 mt-1">Venues</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{totalFields}</div>
                <div className="text-sm text-gray-500 mt-1">Total Fields</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600">{turfCount}</div>
                <div className="text-sm text-gray-500 mt-1">Turf Venues</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                <div className="text-3xl">💡</div>
                <div className="text-sm text-gray-500 mt-1">Insider Tips</div>
            </div>
        </div>
    );
}

export default function StateSportPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const stateSlug = params.state;
    const sport = params.sport;
    const stateCode = STATE_SLUG_TO_CODE[stateSlug?.toLowerCase()] || stateSlug?.toUpperCase();
    const stateName = STATES.find(s => s.code === stateCode)?.name || stateSlug;
    const sportName = sport ? sport.charAt(0).toUpperCase() + sport.slice(1) : "";
    const sportIcon = sport === "baseball" ? "⚾" : sport === "softball" ? "🥎" : "🏆";

    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [surfaceFilter, setSurfaceFilter] = useState("");

    // Fetch venues
    const fetchVenues = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/venues?state=${stateCode}`);
            const data = await res.json();
            setVenues(data.venues || []);
        } catch (error) {
            console.error("Error fetching venues:", error);
        } finally {
            setIsLoading(false);
        }
    }, [stateCode]);

    useEffect(() => {
        fetchVenues();
    }, [fetchVenues]);

    // Filter venues
    const filteredVenues = useMemo(() => {
        return venues.filter((venue) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const searchable = [venue.name, venue.city, venue.overview, ...(venue.organizations || [])].filter(Boolean).join(" ").toLowerCase();
                if (!searchable.includes(query)) return false;
            }
            // Surface filter
            if (surfaceFilter && venue.surface !== surfaceFilter) return false;
            return true;
        });
    }, [venues, searchQuery, surfaceFilter]);

    // Calculate stats
    const stats = useMemo(() => {
        const turfCount = venues.filter(v => v.surface === "turf").length;
        const totalFields = venues.reduce((sum, v) => sum + (v.fields || 0), 0);
        return { turfCount, totalFields };
    }, [venues]);

    const clearFilters = () => {
        setSearchQuery("");
        setSurfaceFilter("");
    };

    const hasActiveFilters = searchQuery || surfaceFilter;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero Header with background image */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=600&fit=crop"
                        alt={`${sportName} stadium`}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-700/85" />
                </div>

                <div className="relative px-4 py-12 sm:py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Breadcrumb */}
                        <nav className="mb-6 flex items-center gap-2 text-sm text-green-200">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <Link href={`/${stateSlug}`} className="hover:text-white transition-colors">{stateName}</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">{sportName} Venues</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-5xl">{sportIcon}</span>
                                    <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                        {stateName} {sportName} Venues
                                    </h1>
                                </div>
                                <p className="max-w-2xl text-lg text-green-100">
                                    Find the best {sportName.toLowerCase()} tournament venues in {stateName}. Get hotel recommendations, restaurant picks, and insider travel tips from tournament families.
                                </p>
                            </div>

                            {/* Quick links */}
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/venues"
                                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
                                >
                                    <span>🗺️</span> All States
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
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            {/* Search Input */}
                            <div className="relative min-w-[200px] sm:w-80">
                                <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search venues..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
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

                            {/* Surface Filter */}
                            <div className="relative">
                                <select
                                    value={surfaceFilter}
                                    onChange={(e) => setSurfaceFilter(e.target.value)}
                                    className="appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-8 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                >
                                    <option value="">All Surfaces</option>
                                    <option value="turf">🌿 Turf Only</option>
                                    <option value="grass">🌱 Grass Only</option>
                                </select>
                                <svg className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="text-sm text-gray-500">
                            {isLoading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </span>
                            ) : (
                                <><span className="font-semibold text-gray-900">{filteredVenues.length}</span> venue{filteredVenues.length !== 1 ? 's' : ''}</>
                            )}
                        </div>
                    </div>

                    {/* Active filter pills */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {searchQuery && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                                    Search: "{searchQuery}"
                                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-green-600">
                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            )}
                            {surfaceFilter && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                                    {surfaceFilter === "turf" ? "🌿 Turf" : "🌱 Grass"}
                                    <button onClick={() => setSurfaceFilter("")} className="ml-1 hover:text-green-600">
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

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Quick Stats (only when no filters active) */}
                {!hasActiveFilters && !isLoading && venues.length > 0 && (
                    <QuickStats
                        venueCount={venues.length}
                        turfCount={stats.turfCount}
                        totalFields={stats.totalFields}
                    />
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading venues...</p>
                        </div>
                    </div>
                ) : filteredVenues.length === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">No venues found</h3>
                        <p className="mt-2 text-gray-600 max-w-md mx-auto">
                            {hasActiveFilters
                                ? "Try adjusting your filters to find more venues."
                                : `No ${sportName.toLowerCase()} venues in ${stateName} yet. Check back soon!`
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            {filteredVenues.map((v, index) => (
                                <VenueCard key={v.id} venue={v} stateSlug={stateSlug} sport={sport} index={index} />
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-12 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-10 text-center">
                            <h3 className="text-2xl font-bold text-white">
                                Know a {sportName.toLowerCase()} venue in {stateName} we're missing?
                            </h3>
                            <p className="mt-3 text-green-100 max-w-xl mx-auto">
                                Help us build the most complete guide for tournament families.
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
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700/50 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700/70 transition-colors"
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