import Link from "next/link";
import { notFound } from "next/navigation";
import { STATES, SPORTS, getStateBySlug, stateCodeToSlug } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";

// Fetch venues for a state
async function getVenuesByState(stateCode) {
    try {
        const res = await fetch(`${API_URL}/api/venues`, {
            next: { revalidate: 3600 },
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.venues || []).filter(
            (v) => v.state?.toUpperCase() === stateCode.toUpperCase()
        );
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

// Sport card component
function SportCard({ sport, state, venueCount }) {
    if (venueCount === 0) return null;

    return (
        <Link
            href={`/${state.slug}/${sport.slug}/venues`}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 hover:shadow-xl transition-all duration-300 hover:border-green-300"
        >
            <div className="relative z-10">
                <span className="text-6xl mb-6 block">{sport.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                    {sport.name}
                </h2>
                <p className="mt-2 text-gray-600">
                    {venueCount} {venueCount === 1 ? "venue" : "venues"} in {state.name}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-green-600 font-semibold group-hover:text-green-700">
                    Browse Venues
                    <svg
                        className="h-5 w-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-green-50 opacity-50 group-hover:scale-150 transition-transform duration-500" />
        </Link>
    );
}

// Venue preview card
function VenuePreviewCard({ venue, stateSlug }) {
    const sport = venue.sports?.[0] || "baseball";

    return (
        <Link
            href={`/${stateSlug}/${sport}/venues/${venue.slug || venue.id}`}
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md hover:border-green-300 transition-all"
        >
            <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-white font-bold ${venue.surface === "turf" ? "bg-emerald-600" : "bg-green-700"
                    }`}
            >
                {venue.fields || "?"}
            </div>
            <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors truncate">
                    {venue.name}
                </h3>
                <p className="text-sm text-gray-500">{venue.city}</p>
            </div>
            <svg
                className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </Link>
    );
}

export default async function StatePage({ params }) {
    const { state: stateSlug } = await params;
    const state = getStateBySlug(stateSlug);

    if (!state) {
        notFound();
    }

    const venues = await getVenuesByState(state.code);

    // Count venues by sport
    const sportCounts = SPORTS.map((sport) => ({
        ...sport,
        count: venues.filter(
            (v) => v.sports?.includes(sport.slug) || (sport.slug === "baseball" && !v.sports?.length)
        ).length,
    }));

    // Get featured venues
    const featuredVenues = [...venues].sort((a, b) => (b.fields || 0) - (a.fields || 0)).slice(0, 6);

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            {/* Hero */}
            <header className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 px-4 py-16 text-white sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <nav className="mb-8">
                        <Link href="/#states" className="inline-flex items-center gap-2 text-green-200 hover:text-white transition-colors text-sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            All States
                        </Link>
                    </nav>

                    <div className="flex items-center gap-4 mb-4">
                        <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-2xl font-bold backdrop-blur-sm">
                            {state.code}
                        </span>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{state.name}</h1>
                            <p className="mt-1 text-green-200">Tournament Venue Guide</p>
                        </div>
                    </div>

                    <p className="mt-4 max-w-2xl text-lg text-green-100">
                        Explore {venues.length} tournament {venues.length === 1 ? "venue" : "venues"} in{" "}
                        {state.name}. Find the perfect destination for your next baseball or softball trip.
                    </p>
                </div>
            </header>

            {/* Sports Section */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Choose Your Sport</h2>

                    {venues.length === 0 ? (
                        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
                            <p className="text-gray-500">No venues in {state.name} yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 max-w-3xl">
                            {sportCounts.map((sport) => (
                                <SportCard key={sport.slug} sport={sport} state={state} venueCount={sport.count} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* All Venues Preview */}
            {featuredVenues.length > 0 && (
                <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">
                            All Venues in {state.name}
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredVenues.map((venue) => (
                                <VenuePreviewCard key={venue.id} venue={venue} stateSlug={state.slug} />
                            ))}
                        </div>

                        {venues.length > 6 && (
                            <p className="mt-6 text-center text-gray-500">
                                And {venues.length - 6} more venues. Select a sport above to see all.
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Quick Links */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-xl bg-green-800 p-8 text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Know of a venue we're missing?</h2>
                        <p className="text-green-100 mb-6">
                            Help other families by adding tournament venues you've visited.
                        </p>
                        <Link
                            href={`/${state.slug}/baseball/venues/add`}
                            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Add a Venue
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}