"use client";

import { useState } from "react";

// Price tier badge component
function PriceTierBadge({ tier }) {
    const config = {
        budget: { label: "Budget-Friendly", color: "bg-green-100 text-green-800" },
        mid: { label: "Mid-Range", color: "bg-blue-100 text-blue-800" },
        upscale: { label: "Upscale", color: "bg-purple-100 text-purple-800" },
    };
    const { label, color } = config[tier] || config.mid;
    return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{label}</span>;
}

// Hotel card component - Full width horizontal layout
function HotelCard({ hotel, venueName, googleApiKey }) {
    const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
    const bookingUrl = hotel.affiliate_url || hotel.booking_url;

    const photoUrl = hotel.photo_reference && googleApiKey
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${hotel.photo_reference}&key=${googleApiKey}`
        : null;

    return (
        <div className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg hover:border-green-300 transition-all">
            <div className="flex flex-col sm:flex-row">
                {photoUrl ? (
                    <div className="sm:w-64 h-48 sm:h-auto shrink-0 bg-gray-100">
                        <img
                            src={photoUrl}
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="sm:w-64 h-48 sm:h-auto shrink-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                )}

                {hotel.price_tier && (
                    <div className="absolute top-3 left-3">
                        <PriceTierBadge tier={hotel.price_tier} />
                    </div>
                )}

                <div className="flex-1 p-5 flex flex-col">
                    <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-700">{hotel.name}</h4>
                                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
                                    {hotel.distance_miles && (
                                        <span className="flex items-center gap-1">
                                            <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {hotel.distance_miles} mi from {venueName}
                                        </span>
                                    )}
                                    {hotel.drive_minutes && (
                                        <span>• {hotel.drive_minutes} min drive</span>
                                    )}
                                </div>
                            </div>
                            {hotel.price_range && (
                                <div className="text-right shrink-0">
                                    <p className="text-sm text-gray-500">From</p>
                                    <p className="text-xl font-bold text-green-600">{hotel.price_range}</p>
                                </div>
                            )}
                        </div>

                        {hotel.why_good && (
                            <div className="mt-4 rounded-lg bg-green-50 p-3">
                                <p className="text-sm text-green-800">
                                    <span className="font-semibold">Why we recommend:</span> {hotel.why_good}
                                </p>
                            </div>
                        )}

                        {amenities.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {amenities.slice(0, 8).map((a, i) => (
                                    <span key={i} className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                                        {a}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        {hotel.family_friendly ? (
                            <p className="inline-flex items-center gap-1 text-sm text-green-600">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Family Friendly
                            </p>
                        ) : (
                            <div />
                        )}

                        {bookingUrl && (
                            <a
                                href={bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer nofollow sponsored"
                                className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                Check Availability & Prices →
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

// Tournament card component - Full card layout
function TournamentCard({ tournament }) {
    const startDate = tournament.start_date ? new Date(tournament.start_date) : null;
    const endDate = tournament.end_date ? new Date(tournament.end_date) : null;

    const formatDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const formatDateShort = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    const dateRange = startDate
        ? endDate && startDate.getTime() !== endDate.getTime()
            ? `${formatDateShort(startDate)} - ${formatDateShort(endDate)}, ${startDate.getFullYear()}`
            : formatDate(startDate)
        : "TBD";

    // Parse age groups if it's a string
    const ageGroups = tournament.age_groups
        ? (typeof tournament.age_groups === "string"
            ? tournament.age_groups.split(",").map(s => s.trim())
            : tournament.age_groups)
        : [];

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 hover:border-green-300 hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-start gap-4">
                        <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-gray-900">{tournament.name}</h4>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                                <span className="flex items-center gap-1.5 text-gray-600">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {dateRange}
                                </span>
                                {tournament.organization && (
                                    <span className="flex items-center gap-1.5 text-gray-600">
                                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                        </svg>
                                        {tournament.organization}
                                    </span>
                                )}
                            </div>

                            {/* Age Groups */}
                            {ageGroups.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs font-medium text-gray-500 mb-2">Age Groups</p>
                                    <div className="flex flex-wrap gap-2">
                                        {ageGroups.map((age, i) => (
                                            <span
                                                key={i}
                                                className="inline-block rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700"
                                            >
                                                {age}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Entry Fee */}
                            {tournament.entry_fee && (
                                <p className="mt-3 text-sm text-gray-600">
                                    <span className="font-medium">Entry Fee:</span> {tournament.entry_fee}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Register Button */}
                <div className="sm:shrink-0">
                    {tournament.registration_url ? (
                        <a
                            href={tournament.registration_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                        >
                            Register Now →
                        </a>
                    ) : (
                        <span className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-gray-100 px-6 py-3 text-sm font-medium text-gray-500">
                            Coming Soon
                        </span>
                    )}
                </div>
            </div>
        </div >
    );
}

// Tab icons
const TabIcons = {
    overview: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    tournaments: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    hotels: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
};

export default function VenuePageTabs({
    children,
    tournaments = [],
    hotels = [],
    venueName,
    tournamentsCount = 0,
    hotelsCount = 0,
    googleApiKey = ""
}) {
    const [activeTab, setActiveTab] = useState("overview");

    // Group hotels by tier
    const hotelsByTier = {
        budget: hotels.filter((h) => h.price_tier === "budget"),
        mid: hotels.filter((h) => h.price_tier === "mid"),
        upscale: hotels.filter((h) => h.price_tier === "upscale"),
        other: hotels.filter((h) => !h.price_tier),
    };

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "tournaments", label: "Tournaments", count: tournamentsCount },
        { id: "hotels", label: "Hotels", count: hotelsCount },
    ];

    return (
        <div>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="flex gap-1 overflow-x-auto" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? "border-green-600 text-green-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                        >
                            {TabIcons[tab.id]}
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === tab.id
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-100 text-gray-600"
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "overview" && children}

                {activeTab === "tournaments" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Upcoming Tournaments
                            </h2>
                            {tournaments.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    {tournaments.length} event{tournaments.length !== 1 ? "s" : ""} scheduled
                                </span>
                            )}
                        </div>

                        {tournaments.length > 0 ? (
                            <div className="space-y-4">
                                {tournaments.map((t, index) => (
                                    <TournamentCard key={t.id || index} tournament={t} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 rounded-xl bg-gray-50">
                                <div className="flex justify-center mb-4 text-gray-400">
                                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Upcoming Tournaments
                                </h3>
                                <p className="text-gray-500">
                                    Check back soon for tournament schedules at {venueName}.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "hotels" && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Where to Stay Near {venueName}
                        </h2>

                        {hotels.length > 0 ? (
                            <>
                                {/* <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
                                    <p className="text-sm text-amber-800">
                                        <strong>Disclosure:</strong> We may earn a commission when you book through our links at no extra cost to you.
                                    </p>
                                </div> */}

                                {hotelsByTier.budget.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-green-500" />
                                            Budget-Friendly
                                        </h3>
                                        <div className="space-y-4">
                                            {hotelsByTier.budget.map((h) => (
                                                <HotelCard key={h.id} hotel={h} venueName={venueName} googleApiKey={googleApiKey} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hotelsByTier.mid.length > 0 && (
                                    <div className="mb-8">
                                        {/* <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-blue-500" />
                                            Mid-Range
                                        </h3> */}
                                        <div className="space-y-4">
                                            {hotelsByTier.mid.map((h) => (
                                                <HotelCard key={h.id} hotel={h} venueName={venueName} googleApiKey={googleApiKey} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hotelsByTier.upscale.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="h-3 w-3 rounded-full bg-purple-500" />
                                            Upscale
                                        </h3>
                                        <div className="space-y-4">
                                            {hotelsByTier.upscale.map((h) => (
                                                <HotelCard key={h.id} hotel={h} venueName={venueName} googleApiKey={googleApiKey} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hotelsByTier.other.length > 0 && (
                                    <div className="space-y-4">
                                        {hotelsByTier.other.map((h) => (
                                            <HotelCard key={h.id} hotel={h} venueName={venueName} googleApiKey={googleApiKey} />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 rounded-xl bg-gray-50">
                                <div className="flex justify-center mb-4 text-gray-400">
                                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No Hotels Listed Yet
                                </h3>
                                <p className="text-gray-500">
                                    We're working on adding hotel recommendations for {venueName}.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}