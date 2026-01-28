"use client";

import { useMemo } from "react";

/**
 * Format date range for display
 */
function formatDateRange(startDate, endDate) {
    if (!startDate) return "Date TBD";

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    const options = { month: "short", day: "numeric" };
    const startStr = start.toLocaleDateString("en-US", options);

    if (!end || start.toDateString() === end.toDateString()) {
        return startStr;
    }

    // Same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
        return `${startStr}-${end.getDate()}`;
    }

    // Different months
    return `${startStr} - ${end.toLocaleDateString("en-US", options)}`;
}

/**
 * Get status badge styling
 */
function getStatusBadge(status) {
    const badges = {
        upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-700" },
        open: { label: "Open", className: "bg-green-100 text-green-700" },
        full: { label: "Full", className: "bg-red-100 text-red-700" },
        in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700" },
        completed: { label: "Completed", className: "bg-gray-100 text-gray-600" },
    };
    return badges[status] || badges.upcoming;
}

/**
 * Single tournament row
 */
function TournamentRow({ tournament }) {
    const statusBadge = getStatusBadge(tournament.status);
    const ageGroups = Array.isArray(tournament.age_groups) ? tournament.age_groups : [];

    return (
        <div className="group border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <div className="p-4 sm:p-5">
                {/* Top Row: Name, Date, Status */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                                {tournament.name}
                            </h4>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}>
                                {statusBadge.label}
                            </span>
                            {tournament.stay_to_play && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Stay-to-Play
                                </span>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            📅 {formatDateRange(tournament.start_date, tournament.end_date)}
                            {tournament.organization && (
                                <span className="ml-3">• {tournament.organization}</span>
                            )}
                        </p>
                    </div>

                    {/* Registration button - desktop */}
                    {tournament.registration_url && (
                        <a
                            href={tournament.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors shrink-0"
                        >
                            View Details
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    )}
                </div>

                {/* Details Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                    {/* Age Groups */}
                    {ageGroups.length > 0 && (
                        <div className="flex items-center gap-2">
                            <span className="text-gray-400">Ages:</span>
                            <div className="flex flex-wrap gap-1">
                                {ageGroups.slice(0, 8).map((age, i) => (
                                    <span key={i} className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
                                        {age}
                                    </span>
                                ))}
                                {ageGroups.length > 8 && (
                                    <span className="text-xs text-gray-400">+{ageGroups.length - 8}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Entry Fee */}
                    {tournament.entry_fee && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Fee:</span>
                            <span className="font-semibold text-gray-900">{tournament.entry_fee}</span>
                        </div>
                    )}

                    {/* Format */}
                    {tournament.format && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Format:</span>
                            <span className="text-gray-700">{tournament.format}</span>
                        </div>
                    )}

                    {/* Teams */}
                    {tournament.teams_registered && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Teams:</span>
                            <span className="text-gray-700">
                                {tournament.teams_registered}
                                {tournament.max_teams && <span className="text-gray-400">/{tournament.max_teams}</span>}
                            </span>
                        </div>
                    )}

                    {/* Director Contact */}
                    {(tournament.director_email || tournament.director_phone) && (
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400">Contact:</span>
                            {tournament.director_email && (
                                <a href={`mailto:${tournament.director_email}`} className="text-green-600 hover:text-green-700 hover:underline">
                                    Email
                                </a>
                            )}
                            {tournament.director_email && tournament.director_phone && (
                                <span className="text-gray-300">|</span>
                            )}
                            {tournament.director_phone && (
                                <a href={`tel:${tournament.director_phone}`} className="text-green-600 hover:text-green-700 hover:underline">
                                    {tournament.director_phone}
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Registration button - mobile */}
                {tournament.registration_url && (
                    <a
                        href={tournament.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="sm:hidden mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                        View Tournament Details
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
}

/**
 * Tournaments Section - displays tournaments grouped by month in table format
 */
export default function TournamentsSection({
    tournaments = [],
    venueName = "",
    showHeader = true
}) {
    // Group tournaments by month
    const groupedTournaments = useMemo(() => {
        const groups = {};

        tournaments.forEach((t) => {
            const date = t.start_date ? new Date(t.start_date) : null;
            const key = date
                ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
                : "TBD";
            const label = date
                ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
                : "Date TBD";

            if (!groups[key]) {
                groups[key] = { label, tournaments: [] };
            }
            groups[key].tournaments.push(t);
        });

        // Sort by date (TBD at end)
        return Object.entries(groups)
            .sort(([a], [b]) => {
                if (a === "TBD") return 1;
                if (b === "TBD") return -1;
                return a.localeCompare(b);
            })
            .map(([, group]) => group);
    }, [tournaments]);

    if (tournaments.length === 0) return null;

    return (
        <section id="tournaments" className="scroll-mt-24">
            {showHeader && (
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Upcoming Tournaments</h2>
                        <p className="text-sm text-gray-500">{tournaments.length} event{tournaments.length !== 1 ? "s" : ""} at {venueName}</p>
                    </div>
                </div>
            )}

            {/* Month Groups */}
            <div className="space-y-8">
                {groupedTournaments.map((group, i) => (
                    <div key={i}>
                        {/* Month Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {group.label}
                            </h3>
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                                {group.tournaments.length} event{group.tournaments.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* Tournament List */}
                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                            {group.tournaments.map((tournament) => (
                                <TournamentRow key={tournament.id} tournament={tournament} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Disclaimer */}
            <div className="mt-8 rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Tournament information is updated regularly but may change.
                    Always verify details with the tournament organizer before registering.
                </p>
            </div>
        </section>
    );
}