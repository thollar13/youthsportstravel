import Link from "next/link";
import Image from "next/image";
import { STATES, SPORTS } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tournamentstay.com";

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
  title: "TournamentStay | Hotels & Travel Guides for Tournament Families",
  description:
    "The ultimate guide for travel baseball and softball families. Find the best hotels near tournament venues, restaurants, and insider tips from parents who've been there.",
  keywords: [
    "travel baseball hotels",
    "softball tournament hotels",
    "youth baseball travel",
    "tournament family travel",
    "USSSA hotels",
    "Perfect Game hotels",
    "sports travel guide",
  ],
  openGraph: {
    title: "TournamentStay | Hotels & Travel Guides for Tournament Families",
    description:
      "Find the best hotels near tournament venues. Insider tips from parents who've been there.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "TournamentStay",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Featured venue card with image
function FeaturedVenueCard({ venue, index }) {
  const stateSlug = venue.state?.toLowerCase() === "fl" ? "florida" :
    venue.state?.toLowerCase() === "tx" ? "texas" :
      venue.state?.toLowerCase() === "ga" ? "georgia" :
        venue.state?.toLowerCase() === "az" ? "arizona" :
          venue.state?.toLowerCase() === "ca" ? "california" : venue.state?.toLowerCase();

  // Placeholder images for venues (different for each)
  const venueImages = [
    "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&h=400&fit=crop", // baseball field
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop", // stadium
    "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=600&h=400&fit=crop", // baseball
    "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=600&h=400&fit=crop", // sports complex
  ];

  return (
    <Link
      href={`/${stateSlug}/baseball/venues/${venue.slug}`}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={venueImages[index % venueImages.length]}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {venue.surface && (
            <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm">
              {venue.surface === "turf" ? "🌿 Turf" : "🌱 Grass"}
            </span>
          )}
          {venue.fields && (
            <span className="rounded-full bg-green-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {venue.fields} Fields
            </span>
          )}
        </div>

        {/* Location overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-sm text-white/90">📍 {venue.city}, {venue.state}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
          {venue.name}
        </h3>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {venue.overview || `Premier tournament venue in ${venue.city} hosting youth baseball and softball events.`}
        </p>
        <div className="mt-4 flex items-center text-sm font-semibold text-green-600">
          View Travel Guide
          <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

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

// Testimonial card
function TestimonialCard({ quote, author, role, image }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div className="flex items-center gap-3">
        <img
          src={image}
          alt={author}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

// Stat card
function StatCard({ number, label, icon }) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-4xl font-bold text-white">{number}</div>
      <div className="text-green-200 mt-1">{label}</div>
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

  // Get featured venues (top 4)
  const featuredVenues = venues
    .filter(v => v.is_published !== false)
    .slice(0, 4);

  // Testimonials data
  const testimonials = [
    {
      quote: "Finally, a site that understands what tournament families actually need! The hotel tips saved us from booking too far from the fields.",
      author: "Sarah M.",
      role: "Baseball Mom, 12U",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "We've been to 30+ tournaments and wish we had this resource years ago. The restaurant recommendations are spot-on.",
      author: "Mike T.",
      role: "Travel Ball Dad",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "The insider tips about parking at LakePoint alone made this worth it. No more walking a mile with all our gear!",
      author: "Jennifer K.",
      role: "Softball Parent, 14U",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop"
            alt="Baseball stadium"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-900/80" />
        </div>

        <div className="relative px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left content */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 text-sm font-medium text-green-200 backdrop-blur-sm border border-green-400/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  {venues.length}+ Venues Across {statesWithVenues.length} States
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Find the <span className="text-green-400">Perfect Hotel</span> for Your Next Tournament
                </h1>

                <p className="mt-6 text-lg text-gray-200 sm:text-xl max-w-xl">
                  Stop Googling for hours. Get insider recommendations from parents who've been there — hotels, restaurants, parking tips, and more.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/venues"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-green-400 transition-colors"
                  >
                    Browse All Venues
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    How It Works
                  </a>
                </div>

                {/* Trust badges */}
                <div className="mt-10 flex items-center gap-6 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% Free</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No Account Required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Parent-Verified Tips</span>
                  </div>
                </div>
              </div>

              {/* Right content - Search/Quick Links */}
              <div className="hidden lg:block">
                <div className="rounded-2xl bg-white/10 backdrop-blur-md p-8 border border-white/20">
                  <h2 className="text-xl font-semibold text-white mb-6">Popular States</h2>
                  <div className="space-y-3">
                    {statesWithVenues.slice(0, 5).map((state) => (
                      <Link
                        key={state.code}
                        href={`/${state.slug}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/30 text-sm font-bold text-white">
                            {state.code}
                          </span>
                          <span className="font-medium text-white">{state.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-300 text-sm">{state.count} venues</span>
                          <svg className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="#states"
                    className="mt-4 block text-center text-green-300 hover:text-white text-sm font-medium transition-colors"
                  >
                    View All States →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="bg-green-700 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number={`${venues.length}+`} label="Tournament Venues" icon="" />
            <StatCard number={`${statesWithVenues.length}`} label="States Covered" icon="" />
            <StatCard number="500+" label="Hotel Recommendations" icon="" />
            <StatCard number="1000+" label="Insider Tips" icon="" />
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
      {featuredVenues.length > 0 && (
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                  Featured Venues
                </h2>
                <p className="mt-2 text-lg text-gray-600">
                  Popular tournament destinations with complete travel guides
                </p>
              </div>
              <Link
                href="/venues"
                className="hidden sm:flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-colors"
              >
                View All Venues
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredVenues.map((venue, index) => (
                <FeaturedVenueCard key={venue.id} venue={venue} index={index} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link
                href="/venues"
                className="inline-flex items-center gap-2 text-green-600 font-semibold"
              >
                View All Venues →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* What We Provide Section */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything You Need for Tournament Travel
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We've done the research so you don't have to. Each venue guide includes everything a tournament family needs.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
              title="Hotel Recommendations"
              description="Hand-picked hotels ranked for tournament families. We tell you WHY each hotel is good, not just that it exists."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              title="Real Drive Times"
              description="Actual tournament morning drive times, not Google's optimistic estimates. Because Saturday at 7am is different."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              title="Where to Eat"
              description="Quick breakfast spots, team dinner restaurants, and grocery stores. All vetted by tournament families."
            />
            <FeatureCard
              icon={
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
              title="Insider Tips"
              description="Parking strategies, what to bring, weather patterns, and secrets only locals know. From parents who've been there."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-white px-4 py-16 sm:px-6 lg:px-8 scroll-mt-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Plan your tournament trip in minutes, not hours
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Find Your Venue</h3>
              <p className="text-gray-600">
                Search by state or browse our complete list of tournament venues across the country.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-green-200" />
            </div>

            <div className="relative text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Read Our Guide</h3>
              <p className="text-gray-600">
                Get our hotel recommendations, restaurant picks, and insider tips all in one place.
              </p>
              {/* Connector line */}
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-green-200" />
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Book & Go</h3>
              <p className="text-gray-600">
                Book your hotel with confidence knowing you've picked the right one for your family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What Tournament Families Say
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Real feedback from parents who use TournamentStay
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by State Section */}
      <section id="states" className="scroll-mt-16 bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Browse by State</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Select a state to explore tournament venues and travel guides
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

      {/* Newsletter CTA Section */}
      <section className="bg-green-700 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Get Tournament Travel Tips
          </h2>
          <p className="mt-4 text-lg text-green-100">
            Join our newsletter for hotel deals, new venue guides, and insider tips from the tournament travel community.
          </p>
          <form className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 max-w-md rounded-lg px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="rounded-lg bg-green-900 px-8 py-4 font-semibold text-white hover:bg-green-800 transition-colors"
            >
              Subscribe Free
            </button>
          </form>
          <p className="mt-4 text-sm text-green-200">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center shadow-xl sm:px-12">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to Plan Your Next Tournament Trip?
            </h2>
            <p className="mt-4 text-lg text-green-100 max-w-2xl mx-auto">
              Stop wasting time researching. Get our complete travel guide and book the right hotel in minutes.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/venues"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 text-lg font-semibold text-green-700 shadow-lg hover:bg-green-50 transition-colors"
              >
                Browse All Venues
              </Link>
              <Link
                href="#states"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-800/50 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm hover:bg-green-800/70 transition-colors"
              >
                Find Your State
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}