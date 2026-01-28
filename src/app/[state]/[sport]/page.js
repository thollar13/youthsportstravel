"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { STATES } from "@/lib/states";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const US_STATES = [
    { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" },
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

const RADIUS_OPTIONS = [
    { value: "25", label: "25 miles" },
    { value: "50", label: "50 miles" },
    { value: "100", label: "100 miles" },
    { value: "150", label: "150 miles" },
    { value: "200", label: "200 miles" },
    { value: "300", label: "300 miles" },
];

function getMonthOptions() {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        options.push({ value, label });
    }
    return options;
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TournamentRow({ tournament, showDistance }) {
    const orgColor = tournament.organization === "Perfect Game" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800";

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="sm:w-32 flex-shrink-0">
                <div className="text-sm font-semibold text-gray-900">{formatDate(tournament.start_date)}</div>
                {tournament.end_date && tournament.end_date !== tournament.start_date && (
                    <div className="text-xs text-gray-500">to {formatDate(tournament.end_date)}</div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{tournament.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${orgColor}`}>{tournament.organization}</span>
                    {tournament.venue_city && <span className="text-sm text-gray-500">{tournament.venue_city}, {tournament.venue_state}</span>}
                    {showDistance && tournament.distance_miles != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {tournament.distance_miles} mi
                        </span>
                    )}
                    {tournament.age_groups?.length > 0 && <span className="text-sm text-gray-500">• {tournament.age_groups.join(", ")}</span>}
                </div>
            </div>
            <div className="flex items-center gap-4">
                {tournament.venue_name && <div className="hidden md:block text-sm text-gray-600 max-w-[200px] truncate">{tournament.venue_name}</div>}
                {tournament.registration_url && (
                    <a href={tournament.registration_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors">
                        Register
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                )}
            </div>
        </div>
    );
}

function VenueRow({ venue, stateSlug, sport }) {
    return (
        <Link href={`/${stateSlug}/${sport}/venues/${venue.slug || venue.id}`} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all">
            <div className="sm:w-12 flex-shrink-0">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${venue.surface === "turf" ? "bg-gradient-to-br from-emerald-500 to-teal-500" : "bg-gradient-to-br from-green-600 to-green-500"}`}>
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">{venue.city}, {venue.state}</span>
                    {venue.fields && <span className="text-sm text-gray-500">• {venue.fields} Fields</span>}
                    {venue.surface && <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">{venue.surface}</span>}
                </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
                {venue.organizations?.slice(0, 2).map((org) => (
                    <span key={org} className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${org === "Perfect Game" ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}`}>{org}</span>
                ))}
            </div>
            <div className="flex-shrink-0 text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </div>
        </Link>
    );
}

function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.totalPages <= 1) return null;
    const { page, totalPages, total, limit, hasNextPage, hasPrevPage } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    const getPageNumbers = () => {
        const pages = [];
        const showPages = 5;
        let start = Math.max(1, page - Math.floor(showPages / 2));
        let end = Math.min(totalPages, start + showPages - 1);
        if (end - start + 1 < showPages) start = Math.max(1, end - showPages + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">Showing {startItem} to {endItem} of {total} results</div>
            <div className="flex items-center gap-2">
                <button onClick={() => onPageChange(page - 1)} disabled={!hasPrevPage} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    Prev
                </button>
                <div className="hidden sm:flex items-center gap-1">
                    {getPageNumbers().map((pageNum) => (
                        <button key={pageNum} onClick={() => onPageChange(pageNum)} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pageNum === page ? "bg-green-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>{pageNum}</button>
                    ))}
                </div>
                <span className="sm:hidden text-sm text-gray-500">Page {page} of {totalPages}</span>
                <button onClick={() => onPageChange(page + 1)} disabled={!hasNextPage} className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    Next
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
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

    const initialTab = searchParams.get("tab") || "tournaments";
    const [activeTab, setActiveTab] = useState(initialTab);

    const [tournaments, setTournaments] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [venues, setVenues] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [locationInfo, setLocationInfo] = useState(null); // Location from API response

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [orgFilter, setOrgFilter] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Radius search
    const [zipCode, setZipCode] = useState("");
    const [debouncedZip, setDebouncedZip] = useState("");
    const [radius, setRadius] = useState("150");
    const [useRadiusSearch, setUseRadiusSearch] = useState(false);
    const [zipError, setZipError] = useState("");

    const monthOptions = useMemo(() => getMonthOptions(), []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCurrentPage(1);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Debounce zip code
    useEffect(() => {
        const timer = setTimeout(() => {
            if (zipCode.length === 5 && /^\d{5}$/.test(zipCode)) {
                setDebouncedZip(zipCode);
                setUseRadiusSearch(true);
                setCurrentPage(1);
                setZipError("");
            } else if (zipCode.length === 0) {
                setDebouncedZip("");
                setUseRadiusSearch(false);
                setLocationInfo(null);
            } else if (zipCode.length > 0 && zipCode.length < 5) {
                setZipError("");
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [zipCode]);

    // Fetch tournaments
    const fetchTournaments = useCallback(async () => {
        setIsLoading(true);
        setZipError("");

        try {
            const apiParams = new URLSearchParams({
                status: "upcoming",
                page: currentPage.toString(),
                limit: "25"
            });

            // Use radius search OR state filter, not both
            if (useRadiusSearch && debouncedZip) {
                apiParams.set("zip", debouncedZip);
                apiParams.set("radius", radius);
            } else {
                apiParams.set("state", stateCode);
            }

            if (debouncedSearch) apiParams.set("search", debouncedSearch);
            if (orgFilter) apiParams.set("organization", orgFilter);
            if (monthFilter) apiParams.set("month", monthFilter);

            const res = await fetch(`${API_URL}/api/tournaments?${apiParams.toString()}`);
            const data = await res.json();

            if (!res.ok) {
                if (data.message?.includes('zip code')) {
                    setZipError(data.message);
                    setUseRadiusSearch(false);
                }
                setTournaments([]);
                setPagination(null);
                return;
            }

            setTournaments(data.tournaments || []);
            setPagination(data.pagination || null);

            // Store location info from API response
            if (data.filters?.location) {
                setLocationInfo(data.filters.location);
            }
        } catch (error) {
            console.error("Error fetching tournaments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [stateCode, currentPage, debouncedSearch, orgFilter, monthFilter, useRadiusSearch, debouncedZip, radius]);

    // Fetch venues
    const fetchVenues = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/venues?state=${stateCode}`);
            const data = await res.json();
            setVenues(data.venues || []);
        } catch (error) {
            console.error("Error fetching venues:", error);
        }
    }, [stateCode]);

    useEffect(() => {
        if (activeTab === "tournaments") fetchTournaments();
    }, [activeTab, fetchTournaments]);

    useEffect(() => { fetchVenues(); }, [fetchVenues]);

    // Update URL
    useEffect(() => {
        const urlParams = new URLSearchParams();
        if (activeTab !== "tournaments") urlParams.set("tab", activeTab);
        if (currentPage > 1) urlParams.set("page", currentPage.toString());
        if (orgFilter) urlParams.set("org", orgFilter);
        if (monthFilter) urlParams.set("month", monthFilter);
        if (useRadiusSearch && debouncedZip) {
            urlParams.set("zip", debouncedZip);
            urlParams.set("radius", radius);
        }
        const queryString = urlParams.toString();
        const newUrl = queryString ? `/${stateSlug}/${sport}?${queryString}` : `/${stateSlug}/${sport}`;
        router.replace(newUrl, { scroll: false });
    }, [activeTab, currentPage, orgFilter, monthFilter, router, stateSlug, sport, useRadiusSearch, debouncedZip, radius]);

    const filteredVenues = useMemo(() => {
        return venues.filter((venue) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return [venue.name, venue.city, venue.overview, ...(venue.organizations || [])].filter(Boolean).join(" ").toLowerCase().includes(query);
            }
            return true;
        });
    }, [venues, searchQuery]);

    const clearFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setOrgFilter("");
        setMonthFilter("");
        setCurrentPage(1);
        setZipCode("");
        setDebouncedZip("");
        setUseRadiusSearch(false);
        setLocationInfo(null);
        setZipError("");
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const hasActiveFilters = searchQuery || orgFilter || monthFilter || useRadiusSearch;

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <header className="bg-gradient-to-r from-green-800 via-green-700 to-green-600 px-4 py-12 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <nav className="mb-6"><Link href="/" className="text-green-200 hover:text-white transition-colors text-sm">← Back to Home</Link></nav>
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        {useRadiusSearch && locationInfo
                            ? `Tournaments near ${locationInfo.city}, ${locationInfo.state}`
                            : `${stateName} ${sport.charAt(0).toUpperCase() + sport.slice(1)}`
                        }
                    </h1>
                    <p className="mt-4 max-w-2xl text-lg text-green-100">
                        {useRadiusSearch && locationInfo
                            ? `Showing tournaments within ${radius} miles of ${locationInfo.zip}`
                            : `Find upcoming tournaments and venues in ${stateName}. Get details on hotels, restaurants, and travel tips.`
                        }
                    </p>
                </div>
            </header>

            <div className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <nav className="flex gap-8" aria-label="Tabs">
                        <button onClick={() => { setActiveTab("tournaments"); clearFilters(); }} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "tournaments" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                            Tournaments
                            {pagination && <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${activeTab === "tournaments" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{pagination.total}</span>}
                        </button>
                        <button onClick={() => { setActiveTab("venues"); setSearchQuery(""); }} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "venues" ? "border-green-600 text-green-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`}>
                            Venues
                            <span className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${activeTab === "venues" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>{venues.length}</span>
                        </button>
                    </nav>
                </div>
            </div>

            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col gap-4">
                        {/* First row: Search + Radius */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            {/* Search Input */}
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input type="text" placeholder={activeTab === "tournaments" ? "Search tournaments..." : "Search venues..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                            </div>

                            {/* Radius Search (tournaments only) */}
                            {activeTab === "tournaments" && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="relative">
                                        <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        <input
                                            type="text"
                                            placeholder="Zip code"
                                            value={zipCode}
                                            onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                                            className={`w-28 rounded-lg border py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 ${zipError ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-green-500 focus:ring-green-500/20'}`}
                                            maxLength={5}
                                        />
                                    </div>
                                    <select
                                        value={radius}
                                        onChange={(e) => { setRadius(e.target.value); setCurrentPage(1); }}
                                        disabled={!useRadiusSearch}
                                        className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:opacity-50 disabled:bg-gray-50"
                                    >
                                        {RADIUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                    {useRadiusSearch && locationInfo && (
                                        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full font-medium">
                                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                            {locationInfo.city}, {locationInfo.state}
                                        </span>
                                    )}
                                    {zipError && (
                                        <span className="text-xs text-red-600">{zipError}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Second row: Other filters */}
                        {activeTab === "tournaments" && (
                            <div className="flex flex-wrap gap-3 items-center justify-between">
                                <div className="flex flex-wrap gap-3 items-center">
                                    <select value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20">
                                        <option value="">All Months</option>
                                        {monthOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                    <select value={orgFilter} onChange={(e) => { setOrgFilter(e.target.value); setCurrentPage(1); }} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20">
                                        <option value="">All Organizations</option>
                                        <option value="Perfect Game">Perfect Game</option>
                                        <option value="USSSA">USSSA</option>
                                    </select>
                                    {hasActiveFilters && (
                                        <button onClick={clearFilters} className="inline-flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                            Clear All
                                        </button>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {pagination ? `${pagination.total} tournament${pagination.total !== 1 ? 's' : ''}` : "Loading..."}
                                </div>
                            </div>
                        )}

                        {activeTab === "venues" && (
                            <div className="flex justify-end">
                                <div className="text-sm text-gray-500">
                                    {`${filteredVenues.length} venue${filteredVenues.length !== 1 ? 's' : ''}`}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {isLoading && activeTab === "tournaments" ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
                            <p className="mt-4 text-gray-600">Loading tournaments...</p>
                        </div>
                    </div>
                ) : activeTab === "tournaments" ? (
                    tournaments.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <h3 className="mt-4 text-lg font-semibold text-gray-900">No tournaments found</h3>
                            <p className="mt-2 text-gray-600">
                                {useRadiusSearch
                                    ? `No tournaments within ${radius} miles. Try expanding your search radius.`
                                    : hasActiveFilters
                                        ? "Try adjusting your filters."
                                        : `No upcoming tournaments in ${stateName}.`
                                }
                            </p>
                            {hasActiveFilters && <button onClick={clearFilters} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors">Clear Filters</button>}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">{tournaments.map((t) => <TournamentRow key={t.id} tournament={t} showDistance={useRadiusSearch} />)}</div>
                            <Pagination pagination={pagination} onPageChange={handlePageChange} />
                        </>
                    )
                ) : filteredVenues.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No venues found</h3>
                        <p className="mt-2 text-gray-600">{searchQuery ? "Try adjusting your search." : `No venues in ${stateName} yet.`}</p>
                    </div>
                ) : (
                    <div className="space-y-3">{filteredVenues.map((v) => <VenueRow key={v.id} venue={v} stateSlug={stateSlug} sport={sport} />)}</div>
                )}
            </div>
            <Footer />
        </main>
    );
}