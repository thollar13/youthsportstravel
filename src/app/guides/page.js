import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tournamentstay.com";

export const metadata = {
    title: "Tournament Travel Guides | TournamentStay",
    description: "Essential guides for baseball and softball tournament travel. Packing lists, hotel tips, budgeting advice, and more from experienced tournament families.",
    openGraph: {
        title: "Tournament Travel Guides",
        description: "Essential guides for tournament families",
        url: `${SITE_URL}/guides`,
    },
    alternates: {
        canonical: `${SITE_URL}/guides`,
    },
};

// Guide images
const guideImages = {
    packing: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop",
    hotels: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
    budget: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop",
    food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
    firstTime: "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=600&h=400&fit=crop",
    weather: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&h=400&fit=crop",
};

// Featured guides
const FEATURED_GUIDES = [
    {
        slug: "first-tournament",
        title: "First Tournament Survival Guide",
        description: "Everything you need to know for your first travel ball tournament. From what to expect to what to pack.",
        image: guideImages.firstTime,
        category: "Getting Started",
        readTime: "10 min read",
        featured: true,
    },
    {
        slug: "packing-checklist",
        title: "The Ultimate Tournament Packing List",
        description: "Never forget the essentials again. A comprehensive checklist for players, parents, and the whole family.",
        image: guideImages.packing,
        category: "Preparation",
        readTime: "5 min read",
        featured: true,
    },
    {
        slug: "hotel-booking-tips",
        title: "How to Book the Best Tournament Hotels",
        description: "Insider tips for finding hotels that are actually close to the fields, clean, and family-friendly.",
        image: guideImages.hotels,
        category: "Accommodations",
        readTime: "7 min read",
        featured: true,
    },
];

// All guides by category
const GUIDE_CATEGORIES = [
    {
        name: "Getting Started",
        icon: "🚀",
        guides: [
            {
                slug: "first-tournament",
                title: "First Tournament Survival Guide",
                description: "Everything first-timers need to know",
                readTime: "10 min",
            },
            {
                slug: "travel-ball-101",
                title: "Travel Ball 101",
                description: "Understanding the tournament circuit",
                readTime: "8 min",
            },
            {
                slug: "tournament-organizations",
                title: "USSSA vs Perfect Game vs Others",
                description: "Comparing major tournament organizations",
                readTime: "6 min",
            },
        ],
    },
    {
        name: "Preparation",
        icon: "📋",
        guides: [
            {
                slug: "packing-checklist",
                title: "Ultimate Packing Checklist",
                description: "Never forget the essentials",
                readTime: "5 min",
            },
            {
                slug: "vehicle-prep",
                title: "Preparing Your Vehicle",
                description: "Road trip ready tips",
                readTime: "4 min",
            },
            {
                slug: "weather-prep",
                title: "Weather Preparation Guide",
                description: "Heat, rain, and everything in between",
                readTime: "6 min",
            },
        ],
    },
    {
        name: "Accommodations",
        icon: "🏨",
        guides: [
            {
                slug: "hotel-booking-tips",
                title: "Hotel Booking Tips",
                description: "Find the best tournament hotels",
                readTime: "7 min",
            },
            {
                slug: "airbnb-vs-hotels",
                title: "Airbnb vs Hotels",
                description: "Which is right for your family?",
                readTime: "5 min",
            },
            {
                slug: "hotel-hacks",
                title: "Tournament Hotel Hacks",
                description: "Make the most of your stay",
                readTime: "4 min",
            },
        ],
    },
    {
        name: "Food & Dining",
        icon: "🍽️",
        guides: [
            {
                slug: "tournament-nutrition",
                title: "Tournament Nutrition Guide",
                description: "Fueling your athlete for peak performance",
                readTime: "8 min",
            },
            {
                slug: "cooler-packing",
                title: "Cooler Packing 101",
                description: "Snacks and meals that travel well",
                readTime: "5 min",
            },
            {
                slug: "team-dinners",
                title: "Planning Team Dinners",
                description: "Restaurant tips for large groups",
                readTime: "4 min",
            },
        ],
    },
    {
        name: "Budget & Planning",
        icon: "💰",
        guides: [
            {
                slug: "tournament-budgeting",
                title: "Tournament Budget Guide",
                description: "Managing costs for the season",
                readTime: "7 min",
            },
            {
                slug: "saving-money",
                title: "Money-Saving Tips",
                description: "Cut costs without cutting corners",
                readTime: "6 min",
            },
            {
                slug: "points-rewards",
                title: "Maximizing Hotel Points",
                description: "Earn rewards on tournament travel",
                readTime: "5 min",
            },
        ],
    },
    {
        name: "At the Tournament",
        icon: "⚾",
        guides: [
            {
                slug: "gameday-checklist",
                title: "Game Day Checklist",
                description: "Everything you need field-side",
                readTime: "4 min",
            },
            {
                slug: "sibling-survival",
                title: "Sibling Survival Guide",
                description: "Keeping non-players entertained",
                readTime: "5 min",
            },
            {
                slug: "parent-etiquette",
                title: "Tournament Parent Etiquette",
                description: "Being a great tournament parent",
                readTime: "6 min",
            },
        ],
    },
];

// Featured guide card (large)
function FeaturedGuideCard({ guide }) {
    return (
        <Link
            href={`/guides/${guide.slug}`}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:shadow-xl hover:border-green-300 transition-all duration-300"
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={guide.image}
                    alt={guide.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-4 left-4">
                    <span className="inline-block rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                        {guide.category}
                    </span>
                </div>

                {/* Title on image */}
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-green-200 transition-colors">
                        {guide.title}
                    </h3>
                </div>
            </div>

            <div className="p-5">
                <p className="text-gray-600 mb-4">{guide.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{guide.readTime}</span>
                    <span className="text-green-600 font-semibold group-hover:text-green-700 transition-colors">
                        Read Guide →
                    </span>
                </div>
            </div>
        </Link>
    );
}

// Small guide card
function GuideCard({ guide }) {
    return (
        <Link
            href={`/guides/${guide.slug}`}
            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md hover:border-green-300 transition-all duration-300"
        >
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {guide.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{guide.description}</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                <span className="text-xs text-gray-400">{guide.readTime}</span>
                <svg className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </Link>
    );
}

// Category section
function CategorySection({ category }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{category.icon}</span>
                <h2 className="text-xl font-bold text-gray-900">{category.name}</h2>
            </div>
            <div className="space-y-3">
                {category.guides.map((guide) => (
                    <GuideCard key={guide.slug} guide={guide} />
                ))}
            </div>
        </div>
    );
}

// Quick tip card
function QuickTipCard({ icon, title, tip }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-green-300 transition-all duration-300">
            <div className="text-3xl mb-3">{icon}</div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600">{tip}</p>
        </div>
    );
}

export default function GuidesPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=1920&h=600&fit=crop"
                        alt="Tournament travel"
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
                            <span className="text-white font-medium">Travel Guides</span>
                        </nav>

                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Travel Guides
                            </h1>
                            <p className="mt-6 text-xl text-green-100">
                                Essential resources for tournament travel. Tips, checklists, and advice from families who've been there.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Quick Tips Bar */}
            <section className="px-4 py-8 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="mx-auto max-w-7xl">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickTipCard
                            icon="🅿️"
                            title="Parking"
                            tip="Arrive 45+ minutes early for prime parking spots near your field."
                        />
                        <QuickTipCard
                            icon="🧊"
                            title="Stay Cool"
                            tip="Freeze water bottles the night before—they'll thaw into cold water."
                        />
                        <QuickTipCard
                            icon="🏨"
                            title="Hotels"
                            tip="Book hotels with free breakfast to save time and money."
                        />
                        <QuickTipCard
                            icon="📱"
                            title="Apps"
                            tip="Download the tournament app before you arrive for schedules and updates."
                        />
                    </div>
                </div>
            </section>

            {/* Featured Guides */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Featured Guides</h2>
                            <p className="text-gray-500 mt-1">Start here for the essentials</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURED_GUIDES.map((guide) => (
                            <FeaturedGuideCard key={guide.slug} guide={guide} />
                        ))}
                    </div>
                </div>
            </section>

            {/* All Guides by Category */}
            <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 border-t border-gray-200">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">All Guides</h2>
                            <p className="text-gray-500 mt-1">Browse by category</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {GUIDE_CATEGORIES.map((category) => (
                            <CategorySection key={category.name} category={category} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl bg-gradient-to-br from-green-800 to-emerald-700 p-8 sm:p-12">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    Get Tournament Tips in Your Inbox
                                </h2>
                                <p className="text-green-100">
                                    Join thousands of tournament families. Get packing lists, travel tips, and venue guides delivered weekly.
                                </p>
                            </div>
                            <div>
                                <form className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        className="flex-1 rounded-lg border-0 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-white"
                                    />
                                    <button
                                        type="submit"
                                        className="rounded-lg bg-white px-6 py-3 font-semibold text-green-700 hover:bg-green-50 transition-colors"
                                    >
                                        Subscribe
                                    </button>
                                </form>
                                <p className="text-green-200 text-sm mt-3">
                                    No spam, unsubscribe anytime.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Have Tips to Share?
                        </h2>
                        <p className="text-green-100 mb-8 max-w-xl mx-auto">
                            Help other tournament families with your knowledge. Suggest guides, share tips, or contribute your experiences.
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