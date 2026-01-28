"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminVenuesPage() {
    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [stateFilter, setStateFilter] = useState("");

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const res = await fetch(`${API_URL}/api/venues`);
                const data = await res.json();
                setVenues(data.venues || []);
            } catch (error) {
                console.error("Error fetching venues:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVenues();
    }, []);

    // Get unique states for the filter dropdown
    const states = useMemo(() => {
        const uniqueStates = [...new Set(venues.map(v => v.state).filter(Boolean))];
        return uniqueStates.sort();
    }, [venues]);

    const filteredVenues = venues.filter((venue) => {
        // State filter
        if (stateFilter && venue.state !== stateFilter) {
            return false;
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                venue.name?.toLowerCase().includes(query) ||
                venue.city?.toLowerCase().includes(query)
            );
        }

        return true;
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Venues</h1>
                <Link
                    href="/admin/venues/add"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                    + Add Venue
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-6 flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Search venues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full max-w-xs rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                <select
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                >
                    <option value="">All States</option>
                    {states.map((state) => (
                        <option key={state} value={state}>
                            {state}
                        </option>
                    ))}
                </select>
                {(searchQuery || stateFilter) && (
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setStateFilter("");
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Results count */}
            {!isLoading && (
                <p className="mb-4 text-sm text-gray-500">
                    Showing {filteredVenues.length} of {venues.length} venues
                    {stateFilter && ` in ${stateFilter}`}
                </p>
            )}

            {isLoading ? (
                <div className="text-center py-12">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
                </div>
            ) : filteredVenues.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No venues found.
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Venue</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Location</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Fields</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Surface</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Coords</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVenues.map((venue) => (
                                <tr key={venue.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900">{venue.name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {venue.city}, {venue.state}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {venue.fields || "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {venue.surface ? (
                                            <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${venue.surface === "turf"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : venue.surface === "grass"
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {venue.surface}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {venue.lat && venue.lng ? (
                                            <span className="text-green-600 text-sm">✓</span>
                                        ) : (
                                            <span className="text-red-500 text-sm">✗</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            href={`/admin/venues/${venue.id}/edit`}
                                            className="text-sm text-green-600 hover:text-green-700 mr-3"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={`/admin/hotels?venue_id=${venue.id}`}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            Hotels
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}