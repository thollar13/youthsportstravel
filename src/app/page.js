import Link from "next/link";
import { STATES, SPORTS, stateCodeToSlug } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";

// Fetch all venues
async function getVenues() {
  try {
    const res = await fetch(`${API_URL}/api/venues`, {
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

// Generate metadata
export const metadata = {
  title: "Travel Sports Venue Guide | Baseball & Softball Tournament Travel",
  description:
    "The ultimate guide for travel baseball and softball families. Find tournament venues, nearby hotels, restaurants, and family activities across the United States.",
  keywords: [
    "travel baseball",
    "travel softball",
    "youth baseball tournaments",
    "softball tournaments",
    "baseball venue guide",
    "tournament travel",
    "sports family travel",
  ],
  openGraph: {
    title: "Travel Sports Venue Guide | Baseball & Softball Tournament Travel",
    description:
      "The ultimate guide for travel baseball and softball families. Find tournament venues, nearby hotels, restaurants, and family activities.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Travel Sports Venue Guide",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Feature card component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

// State card component
function StateCard({ state, venueCount, sports }) {
  return (
    <Link
      href={`/${state.slug}`}
      className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-green-300 hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-sm font-bold text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
          {state.code}
        </span>
        <div>
          <span className="font-medium text-gray-900 group-hover:text-green-700 transition-colors block">
            {state.name}
          </span>
          <span className="text-xs text-gray-500">{sports.join(" • ")}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">{venueCount} venues</span>
        <svg
          className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

// Sport card for homepage
function SportCard({ sport, venueCount }) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100 text-center">
      <span className="text-5xl mb-4 block">{sport.icon}</span>
      <h3 className="text-xl font-bold text-gray-900">{sport.name}</h3>
      <p className="text-gray-500 mt-1">{venueCount} venues nationwide</p>
    </div>
  );
}

export default async function HomePage() {
  const venues = await getVenues();

  // Count venues by state and collect sports per state
  const stateData = venues.reduce((acc, venue) => {
    const stateCode = venue.state?.toUpperCase();
    if (!stateCode) return acc;

    if (!acc[stateCode]) {
      acc[stateCode] = { count: 0, sports: new Set() };
    }
    acc[stateCode].count++;
    (venue.sports || ["baseball"]).forEach((s) => acc[stateCode].sports.add(s));
    return acc;
  }, {});

  // Filter states that have venues
  const statesWithVenues = STATES.filter((state) => stateData[state.code])
    .map((state) => ({
      ...state,
      count: stateData[state.code].count,
      sports: Array.from(stateData[state.code].sports),
    }))
    .sort((a, b) => b.count - a.count);

  // Count venues by sport
  const sportCounts = SPORTS.map((sport) => ({
    ...sport,
    count: venues.filter((v) => v.sports?.includes(sport.slug) || sport.slug === "baseball").length,
  }));

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-emerald-600" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {venues.length} Venues Across {statesWithVenues.length} States
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your Complete Guide to{" "}
              <span className="text-green-300">Tournament Travel</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-green-100 sm:text-xl">
              Find baseball and softball venues, nearby hotels, family-friendly restaurants, and
              local activities. Everything you need to plan your next tournament trip.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="#states"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-green-700 shadow-lg hover:bg-green-50 transition-colors"
              >
                Find Your State
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#FFF"
            />
          </svg>
        </div>
      </header>

      {/* Sports Section */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Sports We Cover</h2>
            <p className="mt-4 text-lg text-gray-600">
              Comprehensive venue guides for youth tournament travel
            </p>
          </div> */}

          {/* <div className="grid gap-6 sm:grid-cols-2 max-w-2xl mx-auto">
            {sportCounts.map((sport) => (
              <SportCard key={sport.slug} sport={sport} venueCount={sport.count} />
            ))}
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need for Tournament Travel
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We know how challenging it can be to plan tournament trips. That's why we've created
              comprehensive guides for every major venue.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Venue Details"
              description="Field counts, surface types, amenities, and everything you need to know about each complex."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              title="Hotel Recommendations"
              description="Hand-picked hotels near each venue, organized by price with family-friendly options highlighted."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Where to Eat"
              description="Local restaurant recommendations from families who've been there. Kid-friendly and quick options."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Family Activities"
              description="Things to do between games. Keep siblings entertained and make the most of your trip."
            />
          </div>
        </div>
      </section>

      {/* Browse by State Section */}
      <section id="states" className="scroll-mt-16 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Browse by State</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Select a state to explore baseball and softball venues in that area.
            </p>
          </div>

          {statesWithVenues.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {statesWithVenues.map((state) => (
                <StateCard
                  key={state.code}
                  state={state}
                  venueCount={state.count}
                  sports={state.sports}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No venues available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-green-800 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">How It Works</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-green-700">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Choose Your State</h3>
              <p className="text-green-100">
                Select from states with tournament venues for baseball or softball.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-green-700">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Find Your Venue</h3>
              <p className="text-green-100">
                Browse venues and read detailed guides with insider tips.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-green-700">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Plan Your Trip</h3>
              <p className="text-green-100">
                Book hotels, find restaurants, and discover local activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </main>
  );
}