import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://youthsportsstay.org";

export const metadata = {
    title: "About Youth Sports Travel | Your Tournament Travel Guide",
    description: "Youth Sports Travel helps baseball and softball families find the best hotels, restaurants, and travel tips for tournament venues across America.",
    openGraph: {
        title: "About Youth Sports Travel",
        description: "Your complete tournament travel guide",
        url: `${SITE_URL}/about`,
    },
    alternates: {
        canonical: `${SITE_URL}/about`,
    },
};

// Team/Value card component
function ValueCard({ icon, title, description }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-3xl mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
}

// Stat card component
function StatCard({ number, label }) {
    return (
        <div className="text-center">
            <div className="text-4xl sm:text-5xl font-bold text-white">{number}</div>
            <div className="text-green-200 mt-1">{label}</div>
        </div>
    );
}

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=1920&h=600&fit=crop"
                        alt="Baseball family at tournament"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-700/80" />
                </div>

                <div className="relative px-4 py-16 sm:py-24 sm:px-6 lg:px-8 h-[375px]">
                    <div className="mx-auto max-w-7xl">
                        {/* Breadcrumb */}
                        <nav className="mb-8 flex items-center gap-2 text-sm text-green-200">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">About</span>
                        </nav>

                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                About Youth Sports Travel
                            </h1>
                            <p className="mt-6 text-xl text-green-100">
                                We're tournament parents just like you. After years of scrambling to find hotels,
                                restaurants, and navigating unfamiliar cities, we built the resource we wished existed.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Stats bar */}
            <section className="bg-green-700 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                        <StatCard number="30+" label="Venues" />
                        <StatCard number="10+" label="States" />
                        <StatCard number="100+" label="Hotel Picks" />
                        <StatCard number="500+" label="Insider Tips" />
                    </div>
                </div>
            </section>

            {/* Our Story */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
                                Our Story
                            </span>
                            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                Built by Tournament Families, For Tournament Families
                            </h2>
                            <div className="mt-6 space-y-4 text-gray-600">
                                <p>
                                    It started with a 3 AM Google search. Another tournament weekend, another unfamiliar city,
                                    and we were desperately trying to figure out which hotel was actually close to the fields
                                    (and not the 20-minute drive the booking site claimed).
                                </p>
                                <p>
                                    After years of tournament travel—the good hotels and the bad, the hidden gem restaurants
                                    and the tourist traps, the parking nightmares and the insider shortcuts—we realized
                                    we'd built up a wealth of knowledge that could help other families.
                                </p>
                                <p>
                                    TournamentStay is that knowledge, organized and shared. Real recommendations from
                                    families who've actually stayed there, eaten there, and navigated the chaos of
                                    tournament weekends.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=500&fit=crop"
                                alt="Baseball tournament"
                                className="rounded-2xl shadow-xl"
                            />
                            <div className="absolute -bottom-6 -left-6 rounded-xl bg-green-600 p-6 text-white shadow-lg">
                                <div className="text-3xl font-bold">2024</div>
                                <div className="text-green-100">Founded</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Offer */}
            <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 border-t border-gray-200">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
                            What We Offer
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Everything You Need for Tournament Travel
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            We've done the research so you don't have to. Here's what you'll find for each venue.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ValueCard
                            icon="🏨"
                            title="Curated Hotel Picks"
                            description="Hand-selected hotels based on proximity, value, and family-friendliness. We tell you which ones are actually close to the fields."
                        />
                        <ValueCard
                            icon="🍽️"
                            title="Restaurant Guides"
                            description="From quick breakfast spots to team dinner venues. Real recommendations for feeding hungry players and tired parents."
                        />
                        <ValueCard
                            icon="💡"
                            title="Insider Tips"
                            description="The stuff you only learn after being there. Best parking, what to bring, weather warnings, and local secrets."
                        />
                        <ValueCard
                            icon="🗺️"
                            title="Venue Details"
                            description="Field counts, surface types, amenities, and everything else you need to know before you arrive."
                        />
                        <ValueCard
                            icon="❓"
                            title="FAQs Answered"
                            description="Common questions answered by families who've been there. No more wondering what to expect."
                        />
                        <ValueCard
                            icon="📍"
                            title="Location Context"
                            description="What's nearby? Entertainment options, grocery stores, and activities for siblings and downtime."
                        />
                    </div>
                </div>
            </section>

            {/* Our Values */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="text-center mb-12">
                        <span className="inline-block rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700 mb-4">
                            Our Values
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            What Guides Us
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="font-bold text-gray-900 mb-2">Honest Reviews</h3>
                            <p className="text-sm text-gray-600">No paid placements. Just real experiences from real families.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                            <h3 className="font-bold text-gray-900 mb-2">Family First</h3>
                            <p className="text-sm text-gray-600">Every recommendation considers the whole family, not just the player.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">🤝</div>
                            <h3 className="font-bold text-gray-900 mb-2">Community Driven</h3>
                            <p className="text-sm text-gray-600">Built on shared knowledge from the tournament community.</p>
                        </div>
                        <div className="text-center p-6">
                            <div className="text-4xl mb-4">🆓</div>
                            <h3 className="font-bold text-gray-900 mb-2">Always Free</h3>
                            <p className="text-sm text-gray-600">This resource is free for all tournament families.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Help Us Grow
                        </h2>
                        <p className="text-green-100 mb-8 max-w-xl mx-auto">
                            Been to a tournament venue? Share your knowledge and help other families have better travel experiences.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-green-700 hover:bg-green-50 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Share Your Tips
                            </Link>
                            <Link
                                href="/venues"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700/50 px-8 py-4 font-semibold text-white hover:bg-green-700/70 transition-colors"
                            >
                                Browse Venues
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}