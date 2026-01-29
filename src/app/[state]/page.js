import Link from "next/link";
import { notFound } from "next/navigation";
import { STATES, SPORTS, getStateBySlug } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tournamentstay.com";

// Placeholder images
const venueImages = [
    "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=400&h=300&fit=crop",
];

const sportImages = {
    baseball: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&h=400&fit=crop",
    softball: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=600&h=400&fit=crop",
};

// Fetch venues for a state
async function getVenuesByState(stateCode) {
    try {
        const res = await fetch(`${API_URL}/api/venues?state=${stateCode}`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.venues || [];
    } catch (error) {
        console.error("Error fetching venues:", error);
        return [];
    }
}

// Generate static params for all states
export async function generateStaticParams() {
    return STATES.map((state) => ({
        state: state.slug,
    }));
}

// Generate metadata
export async function generateMetadata({ params }) {
    const { state: stateSlug } = await params;
    const state = getStateBySlug(stateSlug);

    if (!state) {
        return { title: "State Not Found" };
    }

    return {
        title: `${state.name} Baseball & Softball Venues | Tournament Travel Guide`,
        description: `Find baseball and softball tournament venues in ${state.name}. Complete guides with hotels, restaurants, and family activities for your next tournament trip.`,
        openGraph: {
            title: `${state.name} Baseball & Softball Venues`,
            description: `Tournament venue guides for ${state.name}`,
            url: `${SITE_URL}/${state.slug}`,
        },
        alternates: {
            canonical: `${SITE_URL}/${state.slug}`,
        },
    };
}

// Sport card component with image
function SportCard({ sport, state, venueCount, totalFields }) {
    if (venueCount === 0) return null;

    return (
        <Link
            href={`/${state.slug}/${sport.slug}/venues`}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-all duration-300 hover:border-green-300"
        >
            {/* Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={sportImages[sport.slug] || venueImages[0]}
                    alt={sport.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Sport icon */}
                <div className="absolute top-4 left-4">
                    <span className="text-5xl drop-shadow-lg">{sport.icon}</span>
                </div>

                {/* Stats on image */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{sport.name}</h2>
                        <p className="text-white/80 text-sm">{state.name}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">{venueCount}</div>
                        <div className="text-white/80 text-xs">venues</div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="inline-flex items-center gap-1">
                            <span>🏟️</span> {totalFields} fields
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <span>🏨</span> Hotel guides
                        </span>
                    </div>
                    <div className="inline-flex items-center gap-1 text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                        Explore
                        <svg
                            className="h-4 w-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Venue preview card with image
function VenuePreviewCard({ venue, stateSlug, index }) {
    const sport = venue.sports?.[0] || "baseball";
    const imageIndex = (venue.id || index) % venueImages.length;

    return (
        <Link
            href={`/${stateSlug}/${sport}/venues/${venue.slug || venue.id}`}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg hover:border-green-300 transition-all duration-300"
        >
            {/* Image */}
            <div className="relative h-36 overflow-hidden">
                <img
                    src={venueImages[imageIndex]}
                    alt={venue.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {venue.surface && (
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold text-white ${venue.surface === "turf" ? "bg-emerald-500" : "bg-green-600"
                            }`}>
                            {venue.surface === "turf" ? "🌿 Turf" : "🌱 Grass"}
                        </span>
                    )}
                    {venue.fields && (
                        <span className="inline-block rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-gray-700">
                            {venue.fields} fields
                        </span>
                    )}
                </div>

                {/* Location on image */}
                <div className="absolute bottom-3 left-3">
                    <span className="text-white text-sm font-medium">📍 {venue.city}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors line-clamp-1">
                    {venue.name}
                </h3>
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                        {venue.organizations?.slice(0, 2).map((org) => (
                            <span
                                key={org}
                                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${org === "Perfect Game"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-orange-100 text-orange-700"
                                    }`}
                            >
                                {org}
                            </span>
                        ))}
                    </div>
                    <span className="text-green-600 text-sm font-medium group-hover:text-green-700">
                        View →
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Quick Stats Component
function QuickStats({ venueCount, totalFields, turfCount, stateName }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">{venueCount}</div>
                <div className="text-sm text-gray-500 mt-1">Venues</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="text-3xl font-bold text-green-600">{totalFields}</div>
                <div className="text-sm text-gray-500 mt-1">Total Fields</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="text-3xl font-bold text-emerald-600">{turfCount}</div>
                <div className="text-sm text-gray-500 mt-1">Turf Venues</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center shadow-sm">
                <div className="text-3xl">💡</div>
                <div className="text-sm text-gray-500 mt-1">Travel Tips</div>
            </div>
        </div>
    );
}

export default async function StatePage({ params }) {
    const { state: stateSlug } = await params;
    const state = getStateBySlug(stateSlug);

    if (!state) {
        notFound();
    }

    const venues = await getVenuesByState(state.code);

    // Calculate stats
    const totalFields = venues.reduce((sum, v) => sum + (v.fields || 0), 0);
    const turfCount = venues.filter(v => v.surface === "turf").length;

    // Count venues by sport
    const sportCounts = SPORTS.map((sport) => {
        const sportVenues = venues.filter(
            (v) => v.sports?.includes(sport.slug) || (sport.slug === "baseball" && !v.sports?.length)
        );
        return {
            ...sport,
            count: sportVenues.length,
            totalFields: sportVenues.reduce((sum, v) => sum + (v.fields || 0), 0),
        };
    });

    // Get featured venues (sorted by fields, max 6)
    const featuredVenues = [...venues].sort((a, b) => (b.fields || 0) - (a.fields || 0)).slice(0, 6);

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero with background image */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=600&fit=crop"
                        alt={`${state.name} baseball`}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-700/80" />
                </div>

                <div className="relative px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Breadcrumb */}
                        <nav className="mb-8 flex items-center gap-2 text-sm text-green-200">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <Link href="/venues" className="hover:text-white transition-colors">All Venues</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">{state.name}</span>
                        </nav>

                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 text-3xl font-bold text-white backdrop-blur-sm border border-white/20">
                                        {state.code}
                                    </span>
                                    <div>
                                        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                            {state.name}
                                        </h1>
                                        <p className="mt-1 text-lg text-green-200">Tournament Venue Guide</p>
                                    </div>
                                </div>
                                <p className="max-w-2xl text-lg text-green-100">
                                    Explore {venues.length} tournament {venues.length === 1 ? "venue" : "venues"} in{" "}
                                    {state.name}. Find hotels, restaurants, and insider travel tips for your next tournament trip.
                                </p>
                            </div>

                            {/* Quick action buttons */}
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

            {/* Quick Stats */}
            {venues.length > 0 && (
                <section className="px-4 py-8 sm:px-6 lg:px-8 -mt-8 relative z-10">
                    <div className="mx-auto max-w-7xl">
                        <QuickStats
                            venueCount={venues.length}
                            totalFields={totalFields}
                            turfCount={turfCount}
                            stateName={state.name}
                        />
                    </div>
                </section>
            )}

            {/* Sports Section */}
            <section className="px-4 py-12 pt-0 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Choose Your Sport</h2>
                            <p className="text-gray-500 mt-1">Select a sport to browse venues</p>
                        </div>
                    </div>

                    {venues.length === 0 ? (
                        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">No venues yet</h3>
                            <p className="text-gray-500 mt-2">No venues in {state.name} yet. Check back soon!</p>
                            <Link
                                href="/contact"
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                Suggest a Venue
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl">
                            {sportCounts.map((sport) => (
                                <SportCard
                                    key={sport.slug}
                                    sport={sport}
                                    state={state}
                                    venueCount={sport.count}
                                    totalFields={sport.totalFields}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Featured Venues */}
            {featuredVenues.length > 0 && (
                <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 border-t border-gray-200">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Popular Venues in {state.name}
                                </h2>
                                <p className="text-gray-500 mt-1">Top tournament destinations</p>
                            </div>
                            {venues.length > 6 && (
                                <Link
                                    href={`/${state.slug}/baseball/venues`}
                                    className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                                >
                                    View all {venues.length} →
                                </Link>
                            )}
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredVenues.map((venue, index) => (
                                <VenuePreviewCard
                                    key={venue.id}
                                    venue={venue}
                                    stateSlug={state.slug}
                                    index={index}
                                />
                            ))}
                        </div>

                        {venues.length > 6 && (
                            <div className="mt-8 text-center">
                                <Link
                                    href={`/${state.slug}/baseball/venues`}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    View All {venues.length} Venues in {state.name}
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Bottom CTA */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Know of a venue in {state.name} we're missing?
                        </h2>
                        <p className="text-green-100 mb-8 max-w-xl mx-auto">
                            Help other tournament families by suggesting venues you've visited. Share your insider knowledge!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-green-700 hover:bg-green-50 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Suggest a Venue
                            </Link>
                            <Link
                                href="/venues"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700/50 px-8 py-4 font-semibold text-white hover:bg-green-700/70 transition-colors"
                            >
                                Browse All States
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}