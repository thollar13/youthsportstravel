import Link from "next/link";
import { notFound } from "next/navigation";
import { getStateBySlug, getSportBySlug } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tournamentstay.com";

// ============================================
// Data Fetching
// ============================================

async function getVenue(slug) {
    try {
        const res = await fetch(`${API_URL}/api/venues/${slug}`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.venue || data;
    } catch (error) {
        console.error("Error fetching venue:", error);
        return null;
    }
}

async function getVenueHotels(venueId) {
    try {
        const res = await fetch(`${API_URL}/api/venues/${venueId}/hotels`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.hotels || [];
    } catch (error) {
        console.error("Error fetching hotels:", error);
        return [];
    }
}

async function getVenueRestaurants(venueId) {
    try {
        const res = await fetch(`${API_URL}/api/venues/${venueId}/restaurants`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.restaurants || [];
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        return [];
    }
}

async function getVenueTips(venueId) {
    try {
        const res = await fetch(`${API_URL}/api/venues/${venueId}/tips`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.tips || [];
    } catch (error) {
        console.error("Error fetching tips:", error);
        return [];
    }
}

async function getVenueFaqs(venueId) {
    try {
        const res = await fetch(`${API_URL}/api/venues/${venueId}/faqs`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.faqs || [];
    } catch (error) {
        console.error("Error fetching faqs:", error);
        return [];
    }
}

async function getRelatedVenues(stateCode, currentSlug) {
    try {
        const res = await fetch(`${API_URL}/api/venues?state=${stateCode}`, {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.venues || [])
            .filter((v) => v.slug !== currentSlug)
            .slice(0, 4);
    } catch (error) {
        console.error("Error fetching related venues:", error);
        return [];
    }
}

// ============================================
// Metadata
// ============================================

export async function generateMetadata({ params }) {
    const { state: stateSlug, sport: sportSlug, id } = await params;
    const venue = await getVenue(id);
    const state = getStateBySlug(stateSlug);
    const sport = getSportBySlug(sportSlug);

    if (!venue || !state || !sport) {
        return { title: "Venue Not Found" };
    }

    const title = venue.meta_title || `${venue.name} - Hotels & Travel Guide | TournamentStay`;
    const description = venue.meta_description ||
        `Complete guide to ${venue.name} in ${venue.city}, ${state.name}. Best hotels, restaurants, parking tips for tournament families.`;
    const canonicalUrl = `${SITE_URL}/${stateSlug}/${sportSlug}/venues/${venue.slug}`;

    return {
        title,
        description,
        keywords: [
            venue.name,
            `${venue.name} hotels`,
            `hotels near ${venue.name}`,
            `${venue.city} ${sportSlug} tournaments`,
            `where to stay ${venue.name}`,
        ],
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: "article",
            siteName: "TournamentStay"
        },
        twitter: {
            card: "summary_large_image",
            title,
            description
        },
        alternates: {
            canonical: canonicalUrl
        },
    };
}

// ============================================
// Structured Data (JSON-LD)
// ============================================

function generateStructuredData(venue, hotels, faqs, state, sport, canonicalUrl) {
    const schemas = [];

    // Sports Activity Location
    schemas.push({
        "@context": "https://schema.org",
        "@type": "SportsActivityLocation",
        "@id": canonicalUrl,
        name: venue.name,
        description: venue.overview,
        url: canonicalUrl,
        address: {
            "@type": "PostalAddress",
            streetAddress: venue.address,
            addressLocality: venue.city,
            addressRegion: venue.state,
            addressCountry: "US"
        },
        ...(venue.latitude && venue.longitude ? {
            geo: {
                "@type": "GeoCoordinates",
                latitude: venue.latitude,
                longitude: venue.longitude
            }
        } : {}),
    });

    // Breadcrumbs
    schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: state.name, item: `${SITE_URL}/${state.slug}` },
            { "@type": "ListItem", position: 3, name: `${sport.name} Venues`, item: `${SITE_URL}/${state.slug}/${sport.slug}/venues` },
            { "@type": "ListItem", position: 4, name: venue.name, item: canonicalUrl },
        ],
    });

    // Hotels List
    if (hotels.length > 0) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: `Hotels Near ${venue.name}`,
            numberOfItems: hotels.length,
            itemListElement: hotels.map((h, i) => ({
                "@type": "ListItem",
                position: i + 1,
                item: {
                    "@type": "Hotel",
                    name: h.name,
                    priceRange: h.price_range
                },
            })),
        });
    }

    // FAQs
    if (faqs.length > 0) {
        schemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.answer,
                },
            })),
        });
    }

    return schemas;
}

// ============================================
// Components
// ============================================

function QuickNav({ hotels, restaurants, tips, faqs }) {
    const sections = [
        { id: "hotels", label: "🏨 Where to Stay", count: hotels.length },
        { id: "restaurants", label: "🍽️ Where to Eat", count: restaurants.length },
        { id: "tips", label: "💡 Tips", count: tips.length },
        { id: "faq", label: "❓ FAQ", count: faqs.length },
    ].filter(s => s.count > 0);

    if (sections.length === 0) return null;

    return (
        <nav className="flex flex-wrap gap-3 mb-8">
            {sections.map((s) => (
                <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                >
                    {s.label}
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{s.count}</span>
                </a>
            ))}
        </nav>
    );
}

function CategoryBadge({ category }) {
    const config = {
        best_overall: { label: "⭐ Best Overall", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
        budget: { label: "💰 Best Budget", color: "bg-green-100 text-green-800 border-green-200" },
        families: { label: "👨‍👩‍👧‍👦 Best for Families", color: "bg-blue-100 text-blue-800 border-blue-200" },
        closest: { label: "📍 Closest", color: "bg-purple-100 text-purple-800 border-purple-200" },
        luxury: { label: "✨ Upscale", color: "bg-amber-100 text-amber-800 border-amber-200" },
    };
    const { label, color } = config[category] || { label: category, color: "bg-gray-100 text-gray-800 border-gray-200" };
    return <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${color}`}>{label}</span>;
}

function HotelCard({ hotel, venueName }) {
    const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
    const bookingUrl = hotel.booking_url || hotel.hotels_com_url || hotel.expedia_url;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                    {hotel.category && (
                        <div className="mb-2">
                            <CategoryBadge category={hotel.category} />
                        </div>
                    )}
                    <h4 className="text-lg font-bold text-gray-900">{hotel.name}</h4>
                    <p className="mt-1 text-sm text-gray-500">
                        {hotel.rating && <span className="text-yellow-500">★ {hotel.rating}</span>}
                        {hotel.rating && hotel.distance_miles && <span className="mx-2">•</span>}
                        {hotel.distance_miles && (
                            <span>
                                📍 {hotel.distance_miles} mi
                                {hotel.drive_time_minutes && ` (${hotel.drive_time_minutes} min)`}
                            </span>
                        )}
                    </p>
                </div>
                {hotel.price_range && (
                    <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">per night</p>
                        <p className="text-lg font-bold text-green-600">{hotel.price_range}</p>
                    </div>
                )}
            </div>

            {/* Why Recommended */}
            {hotel.why_recommended && (
                <div className="rounded-lg bg-green-50 border border-green-100 p-4 mb-4">
                    <p className="text-sm text-green-800">
                        <span className="font-semibold">Why we recommend it: </span>
                        {hotel.why_recommended}
                    </p>
                </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {amenities.slice(0, 6).map((amenity, i) => (
                        <span
                            key={i}
                            className="inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                        >
                            {amenity}
                        </span>
                    ))}
                </div>
            )}

            {/* Booking Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
                {hotel.booking_url && (
                    <a
                        href={hotel.booking_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                        Booking.com
                    </a>
                )}
                {hotel.hotels_com_url && (
                    <a
                        href={hotel.hotels_com_url}
                        target="_blank"
                        rel="noopener noreferrer nofollow sponsored"
                        className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                    >
                        Hotels.com
                    </a>
                )}
                {!hotel.booking_url && !hotel.hotels_com_url && (
                    <a
                        href={`https://www.google.com/travel/hotels?q=${encodeURIComponent(hotel.name + ' ' + venueName)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                    >
                        Search Hotels →
                    </a>
                )}
            </div>
        </div>
    );
}

function RestaurantCard({ restaurant }) {
    const categoryIcons = {
        breakfast: "🍳",
        quick: "⚡",
        team_dinner: "🍝",
        grocery: "🛒",
    };
    const icon = categoryIcons[restaurant.category] || "🍽️";

    return (
        <div className="flex gap-4 p-4 rounded-lg border border-gray-200 bg-white">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-lg">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-gray-900">{restaurant.name}</h4>
                    {restaurant.distance_miles && (
                        <span className="text-sm text-gray-500 shrink-0">
                            {restaurant.distance_miles} mi
                        </span>
                    )}
                </div>
                {restaurant.description && (
                    <p className="mt-1 text-sm text-gray-600">{restaurant.description}</p>
                )}
                {restaurant.tip && (
                    <p className="mt-2 text-sm text-green-700 italic">💡 {restaurant.tip}</p>
                )}
            </div>
        </div>
    );
}

function TipCard({ tip }) {
    const categoryIcons = {
        parking: "🅿️",
        what_to_bring: "🎒",
        weather: "🌤️",
        general: "💡",
        food: "🍕",
        timing: "⏰",
    };
    const icon = categoryIcons[tip.category] || "💡";

    return (
        <div className="flex gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-100">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-200 text-sm">
                {icon}
            </div>
            <div>
                <p className="text-gray-800">{tip.tip}</p>
                {tip.source && (
                    <p className="mt-2 text-xs text-gray-500">— {tip.source}</p>
                )}
            </div>
        </div>
    );
}

function FaqSection({ faqs }) {
    return (
        <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
            {faqs.map((faq, i) => (
                <details key={faq.id || i} className="group">
                    <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 hover:bg-gray-50">
                        {faq.question}
                        <span className="ml-4 shrink-0 text-gray-500 group-open:rotate-180 transition-transform">
                            ▼
                        </span>
                    </summary>
                    <div className="px-4 pb-4">
                        <p className="text-gray-600">{faq.answer}</p>
                    </div>
                </details>
            ))}
        </div>
    );
}

function Section({ id, title, icon, children, className = "" }) {
    if (!children) return null;
    return (
        <section id={id} className={`scroll-mt-24 ${className}`}>
            <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-xl">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {children}
        </section>
    );
}

// ============================================
// Main Page Component
// ============================================

export default async function VenueDetailPage({ params }) {
    const { state: stateSlug, sport: sportSlug, id } = await params;

    const state = getStateBySlug(stateSlug);
    const sport = getSportBySlug(sportSlug);

    if (!state || !sport) notFound();

    // Fetch venue first
    const venue = await getVenue(id);
    if (!venue) notFound();

    // Fetch all related data in parallel
    const [hotels, restaurants, tips, faqs, relatedVenues] = await Promise.all([
        getVenueHotels(venue.id),
        getVenueRestaurants(venue.id),
        getVenueTips(venue.id),
        getVenueFaqs(venue.id),
        getRelatedVenues(state.code, venue.slug),
    ]);

    const canonicalUrl = `${SITE_URL}/${stateSlug}/${sportSlug}/venues/${venue.slug}`;
    const structuredData = generateStructuredData(venue, hotels, faqs, state, sport, canonicalUrl);

    // Group restaurants by category
    const restaurantsByCategory = {
        breakfast: restaurants.filter(r => r.category === "breakfast"),
        quick: restaurants.filter(r => r.category === "quick"),
        team_dinner: restaurants.filter(r => r.category === "team_dinner"),
        grocery: restaurants.filter(r => r.category === "grocery"),
        other: restaurants.filter(r => !["breakfast", "quick", "team_dinner", "grocery"].includes(r.category)),
    };

    // Group tips by category
    const tipsByCategory = {
        parking: tips.filter(t => t.category === "parking"),
        what_to_bring: tips.filter(t => t.category === "what_to_bring"),
        weather: tips.filter(t => t.category === "weather"),
        general: tips.filter(t => !["parking", "what_to_bring", "weather"].includes(t.category)),
    };

    // Breadcrumbs
    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: state.name, href: `/${stateSlug}` },
        { label: `${sport.name} Venues`, href: `/${stateSlug}/${sportSlug}/venues` },
        { label: venue.name },
    ];

    return (
        <>
            {/* Structured Data */}
            {structuredData.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            <Navigation />

            <main className="min-h-screen bg-gray-50">
                {/* Hero Header */}
                <header className="relative">
                    <div className={`absolute inset-0 ${venue.surface === "turf"
                        ? "bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600"
                        : "bg-gradient-to-br from-green-800 via-green-700 to-green-600"
                        }`} />

                    <div className="relative px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-6">
                                <Breadcrumbs items={breadcrumbItems} variant="light" />
                            </div>

                            <div className="max-w-4xl">
                                {/* Badges */}
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                                        📍 {venue.city}, {venue.state}
                                    </span>
                                    {venue.fields && (
                                        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                                            🏟️ {venue.fields} Fields
                                        </span>
                                    )}
                                    {venue.surface && (
                                        <span className="inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm capitalize">
                                            🌱 {venue.surface}
                                        </span>
                                    )}
                                    {hotels.length > 0 && (
                                        <span className="inline-block rounded-full bg-green-500/30 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                                            🏨 {hotels.length} Hotels
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                    {venue.name}
                                </h1>
                                <p className="mt-4 text-lg text-white/90">
                                    The Complete Guide for Tournament Families
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Quick Navigation */}
                    <QuickNav hotels={hotels} restaurants={restaurants} tips={tips} faqs={faqs} />

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Overview */}
                            {venue.overview && (
                                <Section id="overview" title="About This Venue" icon="🏟️">
                                    <div className="prose prose-green max-w-none">
                                        <p className="text-gray-700 leading-relaxed text-lg">
                                            {venue.overview}
                                        </p>
                                    </div>

                                    {/* Quick Facts */}
                                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                        {venue.fields && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                                                <span className="text-2xl">🏟️</span>
                                                <div>
                                                    <p className="text-sm text-gray-500">Fields</p>
                                                    <p className="font-semibold">{venue.fields} {venue.surface && venue.surface.charAt(0).toUpperCase() + venue.surface.slice(1)} Fields</p>
                                                </div>
                                            </div>
                                        )}
                                        {venue.address && (
                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200">
                                                <span className="text-2xl">📍</span>
                                                <div>
                                                    <p className="text-sm text-gray-500">Address</p>
                                                    <a
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-semibold text-green-600 hover:text-green-700 hover:underline"
                                                    >
                                                        {venue.address}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Section>
                            )}

                            {/* Hotels Section */}
                            {hotels.length > 0 && (
                                <Section id="hotels" title="Where to Stay" icon="🏨">
                                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 mb-6">
                                        <p className="text-amber-800">
                                            <span className="font-semibold">⚠️ Book Early!</span> Hotels fill up 4-6 weeks before major tournaments. Don't wait!
                                        </p>
                                    </div>

                                    <p className="text-gray-600 mb-6">
                                        Our top hotel picks for tournament families visiting {venue.name}.
                                        All distances and drive times are from the venue.
                                    </p>

                                    <div className="space-y-6">
                                        {hotels.map((hotel) => (
                                            <HotelCard
                                                key={hotel.id}
                                                hotel={hotel}
                                                venueName={venue.name}
                                            />
                                        ))}
                                    </div>

                                    {/* Hotel Tips */}
                                    <div className="mt-8 p-6 rounded-xl bg-green-50 border border-green-100">
                                        <h4 className="font-semibold text-gray-900 mb-3">💡 Insider Hotel Tips</h4>
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li>• Ask for "tournament rate" - some hotels offer 10-15% off</li>
                                            <li>• Book hotels with kitchenettes for stays of 3+ nights to save on food</li>
                                            <li>• Check drive time on Google Maps for Saturday morning (tournament traffic!)</li>
                                        </ul>
                                    </div>
                                </Section>
                            )}

                            {/* Restaurants Section */}
                            {restaurants.length > 0 && (
                                <Section id="restaurants" title={`Where to Eat Near ${venue.name}`} icon="🍽️">
                                    <div className="space-y-8">
                                        {restaurantsByCategory.breakfast.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                    🍳 Quick Breakfast (Get to fields fast)
                                                </h3>
                                                <div className="space-y-3">
                                                    {restaurantsByCategory.breakfast.map((r) => (
                                                        <RestaurantCard key={r.id} restaurant={r} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {restaurantsByCategory.team_dinner.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                    🍝 Team Dinners
                                                </h3>
                                                <div className="space-y-3">
                                                    {restaurantsByCategory.team_dinner.map((r) => (
                                                        <RestaurantCard key={r.id} restaurant={r} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {restaurantsByCategory.quick.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                    ⚡ Quick Bites
                                                </h3>
                                                <div className="space-y-3">
                                                    {restaurantsByCategory.quick.map((r) => (
                                                        <RestaurantCard key={r.id} restaurant={r} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {restaurantsByCategory.grocery.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                    🛒 Grocery / Cooler Supplies
                                                </h3>
                                                <div className="space-y-3">
                                                    {restaurantsByCategory.grocery.map((r) => (
                                                        <RestaurantCard key={r.id} restaurant={r} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {restaurantsByCategory.other.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                                    🍽️ Other Options
                                                </h3>
                                                <div className="space-y-3">
                                                    {restaurantsByCategory.other.map((r) => (
                                                        <RestaurantCard key={r.id} restaurant={r} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Section>
                            )}

                            {/* Tips Section */}
                            {tips.length > 0 && (
                                <Section id="tips" title="Tips from Tournament Parents" icon="💡">
                                    <div className="space-y-8">
                                        {tipsByCategory.parking.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">🅿️ Parking</h3>
                                                <div className="space-y-3">
                                                    {tipsByCategory.parking.map((tip) => (
                                                        <TipCard key={tip.id} tip={tip} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {tipsByCategory.what_to_bring.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎒 What to Bring</h3>
                                                <div className="space-y-3">
                                                    {tipsByCategory.what_to_bring.map((tip) => (
                                                        <TipCard key={tip.id} tip={tip} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {tipsByCategory.weather.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">🌤️ Weather</h3>
                                                <div className="space-y-3">
                                                    {tipsByCategory.weather.map((tip) => (
                                                        <TipCard key={tip.id} tip={tip} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {tipsByCategory.general.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Good to Know</h3>
                                                <div className="space-y-3">
                                                    {tipsByCategory.general.map((tip) => (
                                                        <TipCard key={tip.id} tip={tip} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Section>
                            )}

                            {/* FAQ Section */}
                            {faqs.length > 0 && (
                                <Section id="faq" title="Frequently Asked Questions" icon="❓">
                                    <FaqSection faqs={faqs} />
                                </Section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <aside className="space-y-6">
                            <div className="sticky top-24 space-y-6">
                                {/* Quick Facts Card */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-4">Quick Facts</h3>
                                    <dl className="space-y-4 text-sm">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500">Location</dt>
                                            <dd className="font-medium text-gray-900">{venue.city}, {venue.state}</dd>
                                        </div>
                                        {venue.fields && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Fields</dt>
                                                <dd className="font-medium text-gray-900">{venue.fields}</dd>
                                            </div>
                                        )}
                                        {venue.surface && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Surface</dt>
                                                <dd className="font-medium text-gray-900 capitalize">{venue.surface}</dd>
                                            </div>
                                        )}
                                        {hotels.length > 0 && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500">Nearby Hotels</dt>
                                                <dd className="font-medium text-green-600">{hotels.length}</dd>
                                            </div>
                                        )}
                                    </dl>

                                    <hr className="my-6 border-gray-200" />

                                    {hotels.length > 0 && (
                                        <a
                                            href="#hotels"
                                            className="block w-full rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors mb-3"
                                        >
                                            Find Hotels →
                                        </a>
                                    )}

                                    {venue.address && (
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            📍 Get Directions
                                        </a>
                                    )}
                                </div>

                                {/* Related Venues */}
                                {relatedVenues.length > 0 && (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <h3 className="font-semibold text-gray-900 mb-4">
                                            Other {state.name} Venues
                                        </h3>
                                        <ul className="space-y-3">
                                            {relatedVenues.map((v) => (
                                                <li key={v.id}>
                                                    <Link
                                                        href={`/${stateSlug}/${sportSlug}/venues/${v.slug}`}
                                                        className="group flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold ${v.surface === "turf" ? "bg-emerald-600" : "bg-green-700"
                                                            }`}>
                                                            {v.fields || "?"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 group-hover:text-green-600 truncate">
                                                                {v.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">{v.city}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={`/${stateSlug}/${sportSlug}/venues`}
                                            className="mt-4 block text-center text-sm font-medium text-green-600 hover:text-green-700"
                                        >
                                            View All {state.name} Venues →
                                        </Link>
                                    </div>
                                )}

                                {/* Email CTA */}
                                <div className="rounded-xl bg-green-50 border border-green-100 p-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">
                                        📧 Get Tournament Travel Tips
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Join our newsletter for hotel deals and insider tips.
                                    </p>
                                    <Link
                                        href="/newsletter"
                                        className="block w-full rounded-lg bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                                    >
                                        Subscribe Free
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Bottom CTA */}
                <section className="bg-white border-t border-gray-200 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Explore More {state.name} Venues
                        </h2>
                        <p className="mt-4 text-gray-600">
                            Find hotels and travel guides for all {sport.name.toLowerCase()} tournament venues in {state.name}.
                        </p>
                        <Link
                            href={`/${stateSlug}/${sportSlug}/venues`}
                            className="mt-8 inline-block rounded-lg bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700 transition-colors"
                        >
                            View All {state.name} Venues →
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}