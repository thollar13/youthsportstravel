"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getStateBySlug, getSportBySlug } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function VenueCard({ venue, stateSlug, sportSlug }) {
    // Truncate description to 250 chars
    const description = venue.overview
        ? (venue.overview.length > 250 ? venue.overview.slice(0, 250) + "..." : venue.overview)
        : null;

    return (
        <Link
            href={`/${stateSlug}/${sportSlug}/venues/${venue.slug || venue.id}`}
            className="group rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-green-300"
        >
            <div
                className={`relative h-40 ${venue.surface === "turf"
                    ? "bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500"
                    : "bg-gradient-to-br from-green-700 via-green-600 to-green-500"
                    }`}
            >
                <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div className="flex flex-wrap gap-2">
                        {venue.fields && (
                            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                {venue.fields} Fields
                            </span>
                        )}
                        {venue.surface && (
                            <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm capitalize">
                                {venue.surface}
                            </span>
                        )}
                        {venue.tournamentCount > 0 && (
                            <span className="inline-block rounded-full bg-green-500/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                🏆 {venue.tournamentCount} Event{venue.tournamentCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm w-fit">
                        📍 {venue.city}
                    </span>
                </div>
            </div>
            <div className="p-5">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {venue.name}
                </h2>
                {description && (
                    <p className="mt-2 text-sm text-gray-500">
                        {description}
                    </p>
                )}
                {venue.organizations?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {venue.organizations.slice(0, 3).map((org) => (
                            <span key={org} className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                {org}
                            </span>
                        ))}
                    </div>
                )}
                <div className="mt-4 flex items-center text-sm font-semibold text-green-600 group-hover:text-green-700">
                    View Guide →
                </div>
            </div>
        </Link>
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
        if (!searchQuery) return venues;
        const query = searchQuery.toLowerCase();
        return venues.filter((venue) => {
            const searchFields = [venue.name, venue.city, ...(venue.organizations || [])].join(" ").toLowerCase();
            return searchFields.includes(query);
        });
    }, [venues, searchQuery]);

    if (!state || !sport) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500">Invalid state or sport</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <header className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 px-4 py-12 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <nav className="mb-6 flex items-center gap-2 text-sm text-green-200">
                        <Link href="/" className="hover:text-white">Home</Link>
                        <span>/</span>
                        <Link href={`/${stateSlug}`} className="hover:text-white">{state.name}</Link>
                        <span>/</span>
                        <span className="text-white font-medium">{sport.name}</span>
                    </nav>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{sport.icon}</span>
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                            {state.name} {sport.name} Venues
                        </h1>
                    </div>
                    <p className="mt-4 max-w-2xl text-lg text-green-100">
                        Find {sport.name.toLowerCase()} tournament venues in {state.name} with hotels, restaurants, and travel tips.
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search venues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                    />
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading venues...</p>
                    </div>
                ) : filteredVenues.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No venues found.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredVenues.map((venue) => (
                            <VenueCard key={venue.id} venue={venue} stateSlug={stateSlug} sportSlug={sportSlug} />
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </main>
    );
}