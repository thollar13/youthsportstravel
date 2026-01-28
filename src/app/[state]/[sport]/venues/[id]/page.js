import Link from "next/link";
import { notFound } from "next/navigation";
import { getStateBySlug, getSportBySlug } from "@/lib/states";
import Navigation from "@/components/Navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Footer from "@/components/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tournamentstay.com";

// Placeholder images
const venueHeroImages = [
    "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=1920&h=600&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=600&fit=crop",
    "https://images.unsplash.com/photo-1562771379-eafdca7a02f8?w=1920&h=600&fit=crop",
];

const hotelImages = [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop",
];

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
        { id: "hotels", label: "Where to Stay", icon: "🏨", count: hotels.length },
        { id: "restaurants", label: "Where to Eat", icon: "🍽️", count: restaurants.length },
        { id: "tips", label: "Insider Tips", icon: "💡", count: tips.length },
        { id: "faq", label: "FAQ", icon: "❓", count: faqs.length },
    ].filter(s => s.count > 0);

    if (sections.length === 0) return null;

    return (
        <nav className="bg-white rounded-xl border border-gray-200 p-2 mb-8 shadow-sm">
            <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="flex-1 min-w-[140px] flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                    >
                        <span className="text-lg">{s.icon}</span>
                        <span>{s.label}</span>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{s.count}</span>
                    </a>
                ))}
            </div>
        </nav>
    );
}

function CategoryBadge({ category }) {
    const config = {
        best_overall: { label: "⭐ Best Overall", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
        budget: { label: "💰 Best Budget", color: "bg-green-100 text-green-800 border-green-300" },
        families: { label: "👨‍👩‍👧‍👦 Best for Families", color: "bg-blue-100 text-blue-800 border-blue-300" },
        closest: { label: "📍 Closest to Venue", color: "bg-purple-100 text-purple-800 border-purple-300" },
        luxury: { label: "✨ Upscale Pick", color: "bg-amber-100 text-amber-800 border-amber-300" },
    };
    const { label, color } = config[category] || { label: category, color: "bg-gray-100 text-gray-800 border-gray-300" };
    return <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${color}`}>{label}</span>;
}

function HotelCard({ hotel, venueName, index }) {
    const amenities = Array.isArray(hotel.amenities) ? hotel.amenities : [];
    const imageIndex = (hotel.id || index) % hotelImages.length;

    return (
        <div className="group rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex flex-col md:flex-row">
                {/* Image */}
                <div className="relative h-48 md:h-auto md:w-64 flex-shrink-0 overflow-hidden">
                    <img
                        src={hotelImages[imageIndex]}
                        alt={hotel.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:bg-gradient-to-r" />

                    {/* Category badge on image */}
                    {hotel.category && (
                        <div className="absolute top-3 left-3">
                            <CategoryBadge category={hotel.category} />
                        </div>
                    )}

                    {/* Price on image (mobile) */}
                    {hotel.price_range && (
                        <div className="absolute bottom-3 right-3 md:hidden">
                            <span className="rounded-lg bg-white/95 px-3 py-1.5 text-lg font-bold text-green-600 shadow-sm">
                                {hotel.price_range}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                                {hotel.name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                                {hotel.rating && (
                                    <span className="inline-flex items-center gap-1">
                                        <span className="text-yellow-500">★</span>
                                        <span className="font-medium text-gray-700">{hotel.rating}</span>
                                    </span>
                                )}
                                {hotel.distance_miles && (
                                    <span className="inline-flex items-center gap-1">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        {hotel.distance_miles} mi from venue
                                    </span>
                                )}
                                {hotel.drive_time_minutes && (
                                    <span className="inline-flex items-center gap-1">
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {hotel.drive_time_minutes} min drive
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price (desktop) */}
                        {hotel.price_range && (
                            <div className="hidden md:block text-right">
                                <p className="text-xs text-gray-500">from</p>
                                <p className="text-2xl font-bold text-green-600">{hotel.price_range}</p>
                                <p className="text-xs text-gray-500">per night</p>
                            </div>
                        )}
                    </div>

                    {/* Why Recommended */}
                    {hotel.why_recommended && (
                        <div className="mt-4 rounded-lg bg-green-50 border border-green-100 p-4">
                            <p className="text-sm text-green-800">
                                <span className="font-bold">💡 Why we recommend: </span>
                                {hotel.why_recommended}
                            </p>
                        </div>
                    )}

                    {/* Amenities */}
                    {amenities.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {amenities.slice(0, 6).map((amenity, i) => (
                                <span
                                    key={i}
                                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                                >
                                    {amenity}
                                </span>
                            ))}
                            {amenities.length > 6 && (
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
                                    +{amenities.length - 6} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Booking Buttons */}
                    <div className="flex flex-wrap gap-3 mt-5">
                        {hotel.booking_url && (
                            <a
                                href={hotel.booking_url}
                                target="_blank"
                                rel="noopener noreferrer nofollow sponsored"
                                className="flex-1 min-w-[120px] rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                                Book on Booking.com
                            </a>
                        )}
                        {hotel.hotels_com_url && (
                            <a
                                href={hotel.hotels_com_url}
                                target="_blank"
                                rel="noopener noreferrer nofollow sponsored"
                                className="flex-1 min-w-[120px] rounded-lg bg-red-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-red-700 transition-colors"
                            >
                                Book on Hotels.com
                            </a>
                        )}
                        {!hotel.booking_url && !hotel.hotels_com_url && (
                            <a
                                href={`https://www.google.com/travel/hotels?q=${encodeURIComponent(hotel.name + ' ' + venueName)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                Search on Google Hotels →
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function RestaurantCard({ restaurant }) {
    const categoryConfig = {
        breakfast: { icon: "🍳", label: "Breakfast", color: "bg-yellow-100 text-yellow-800" },
        quick: { icon: "⚡", label: "Quick Bite", color: "bg-blue-100 text-blue-800" },
        team_dinner: { icon: "🍝", label: "Team Dinner", color: "bg-purple-100 text-purple-800" },
        grocery: { icon: "🛒", label: "Grocery", color: "bg-green-100 text-green-800" },
    };
    const config = categoryConfig[restaurant.category] || { icon: "🍽️", label: "Restaurant", color: "bg-gray-100 text-gray-800" };

    return (
        <div className="flex gap-4 p-5 rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-green-200 transition-all">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                {config.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h4 className="font-bold text-gray-900">{restaurant.name}</h4>
                        <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                            {config.label}
                        </span>
                    </div>
                    {restaurant.distance_miles && (
                        <span className="text-sm text-gray-500 shrink-0 bg-gray-100 rounded-full px-2 py-1">
                            📍 {restaurant.distance_miles} mi
                        </span>
                    )}
                </div>
                {restaurant.description && (
                    <p className="mt-2 text-sm text-gray-600">{restaurant.description}</p>
                )}
                {restaurant.tip && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                        <p className="text-sm text-amber-800">💡 <span className="font-medium">Pro tip:</span> {restaurant.tip}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TipCard({ tip }) {
    const categoryConfig = {
        parking: { icon: "🅿️", color: "bg-blue-50 border-blue-200" },
        what_to_bring: { icon: "🎒", color: "bg-purple-50 border-purple-200" },
        weather: { icon: "🌤️", color: "bg-cyan-50 border-cyan-200" },
        general: { icon: "💡", color: "bg-yellow-50 border-yellow-200" },
        food: { icon: "🍕", color: "bg-orange-50 border-orange-200" },
        timing: { icon: "⏰", color: "bg-green-50 border-green-200" },
    };
    const config = categoryConfig[tip.category] || { icon: "💡", color: "bg-yellow-50 border-yellow-200" };

    return (
        <div className={`flex gap-4 p-4 rounded-xl border ${config.color}`}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm text-xl">
                {config.icon}
            </div>
            <div className="flex-1">
                <p className="text-gray-800 leading-relaxed">{tip.tip}</p>
                {tip.source && (
                    <p className="mt-2 text-xs text-gray-500 italic">— {tip.source}</p>
                )}
            </div>
        </div>
    );
}

function FaqSection({ faqs }) {
    return (
        <div className="space-y-3">
            {faqs.map((faq, i) => (
                <details key={faq.id || i} className="group rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold text-gray-900 hover:bg-gray-50 transition-colors">
                        <span className="pr-4">{faq.question}</span>
                        <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform duration-200">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </summary>
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                </details>
            ))}
        </div>
    );
}

function Section({ id, title, icon, description, children, className = "" }) {
    if (!children) return null;
    return (
        <section id={id} className={`scroll-mt-24 ${className}`}>
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
                        {icon}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
                {description && (
                    <p className="text-gray-600 ml-15">{description}</p>
                )}
            </div>
            {children}
        </section>
    );
}

function RelatedVenueCard({ venue, stateSlug, sportSlug }) {
    const venueImages = [
        "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=300&h=200&fit=crop",
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=200&fit=crop",
        "https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=300&h=200&fit=crop",
    ];
    const imageIndex = (venue.id || 0) % venueImages.length;

    return (
        <Link
            href={`/${stateSlug}/${sportSlug}/venues/${venue.slug}`}
            className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:border-green-300 transition-all"
        >
            <div className="relative h-32 overflow-hidden">
                <img
                    src={venueImages[imageIndex]}
                    alt={venue.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium truncate">{venue.city}</p>
                </div>
            </div>
            <div className="p-3">
                <h4 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1 text-sm">
                    {venue.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                    {venue.fields && (
                        <span className="text-xs text-gray-500">⚾ {venue.fields} fields</span>
                    )}
                    {venue.surface && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${venue.surface === "turf" ? "bg-emerald-100 text-emerald-700" : "bg-green-100 text-green-700"}`}>
                            {venue.surface}
                        </span>
                    )}
                </div>
            </div>
        </Link>
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

    const venue = await getVenue(id);
    if (!venue) notFound();

    const [hotels, restaurants, tips, faqs, relatedVenues] = await Promise.all([
        getVenueHotels(venue.id),
        getVenueRestaurants(venue.id),
        getVenueTips(venue.id),
        getVenueFaqs(venue.id),
        getRelatedVenues(state.code, venue.slug),
    ]);

    const canonicalUrl = `${SITE_URL}/${stateSlug}/${sportSlug}/venues/${venue.slug}`;
    const structuredData = generateStructuredData(venue, hotels, faqs, state, sport, canonicalUrl);

    const heroImageIndex = (venue.id || 0) % venueHeroImages.length;

    const restaurantsByCategory = {
        breakfast: restaurants.filter(r => r.category === "breakfast"),
        quick: restaurants.filter(r => r.category === "quick"),
        team_dinner: restaurants.filter(r => r.category === "team_dinner"),
        grocery: restaurants.filter(r => r.category === "grocery"),
        other: restaurants.filter(r => !["breakfast", "quick", "team_dinner", "grocery"].includes(r.category)),
    };

    const tipsByCategory = {
        parking: tips.filter(t => t.category === "parking"),
        what_to_bring: tips.filter(t => t.category === "what_to_bring"),
        weather: tips.filter(t => t.category === "weather"),
        general: tips.filter(t => !["parking", "what_to_bring", "weather"].includes(t.category)),
    };

    const breadcrumbItems = [
        { label: "Home", href: "/" },
        { label: state.name, href: `/${stateSlug}` },
        { label: `${sport.name} Venues`, href: `/${stateSlug}/${sportSlug}/venues` },
        { label: venue.name },
    ];

    return (
        <>
            {structuredData.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}

            <Navigation />

            <main className="min-h-screen bg-gray-50">
                <header className="relative">
                    <div className="absolute inset-0">
                        <img
                            src={venueHeroImages[heroImageIndex]}
                            alt={venue.name}
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/85 to-green-900/80" />
                    </div>

                    <div className="relative px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-20">
                        <div className="mx-auto max-w-7xl">
                            <div className="mb-6">
                                <Breadcrumbs items={breadcrumbItems} variant="light" />
                            </div>

                            <div className="max-w-4xl">
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/10">
                                        📍 {venue.city}, {venue.state}
                                    </span>
                                    {venue.fields && (
                                        <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/10">
                                            ⚾ {venue.fields} Fields
                                        </span>
                                    )}
                                    {venue.surface && (
                                        <span className={`inline-block rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-sm border border-white/10 ${venue.surface === "turf" ? "bg-emerald-500/30" : "bg-green-500/30"}`}>
                                            {venue.surface === "turf" ? "🌿 Turf" : "🌱 Grass"}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                                    {venue.name}
                                </h1>
                                <p className="mt-4 text-xl text-white/90">
                                    Complete Travel Guide for Tournament Families
                                </p>

                                <div className="mt-8 flex flex-wrap gap-6">
                                    {hotels.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">🏨</span>
                                            <div>
                                                <p className="text-2xl font-bold">{hotels.length}</p>
                                                <p className="text-sm text-white/80">Hotels</p>
                                            </div>
                                        </div>
                                    )}
                                    {restaurants.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">🍽️</span>
                                            <div>
                                                <p className="text-2xl font-bold">{restaurants.length}</p>
                                                <p className="text-sm text-white/80">Restaurants</p>
                                            </div>
                                        </div>
                                    )}
                                    {tips.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">💡</span>
                                            <div>
                                                <p className="text-2xl font-bold">{tips.length}</p>
                                                <p className="text-sm text-white/80">Tips</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <QuickNav hotels={hotels} restaurants={restaurants} tips={tips} faqs={faqs} />

                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-12">
                            {venue.overview && (
                                <Section id="overview" title="About This Venue" icon="🏟️">
                                    <div className="rounded-xl border border-gray-200 bg-white p-6">
                                        <p className="text-gray-700 leading-relaxed text-lg">{venue.overview}</p>
                                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                            {venue.fields && (
                                                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                                                    <span className="text-3xl">⚾</span>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Number of Fields</p>
                                                        <p className="font-bold text-gray-900">{venue.fields} {venue.surface && venue.surface.charAt(0).toUpperCase() + venue.surface.slice(1)} Fields</p>
                                                    </div>
                                                </div>
                                            )}
                                            {venue.address && (
                                                <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50">
                                                    <span className="text-3xl">📍</span>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Address</p>
                                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`} target="_blank" rel="noopener noreferrer" className="font-bold text-green-600 hover:text-green-700 hover:underline">Get Directions →</a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {hotels.length > 0 && (
                                <Section id="hotels" title="Where to Stay" icon="🏨" description={`Our top ${hotels.length} hotel picks for families visiting ${venue.name}`}>
                                    <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-5 mb-6">
                                        <div className="flex items-start gap-4">
                                            <span className="text-3xl">⚠️</span>
                                            <div>
                                                <h4 className="font-bold text-amber-900">Book Early!</h4>
                                                <p className="text-amber-800 mt-1">Hotels near {venue.name} fill up 4-6 weeks before major tournaments. Don't wait until the last minute!</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        {hotels.map((hotel, index) => (<HotelCard key={hotel.id} hotel={hotel} venueName={venue.name} index={index} />))}
                                    </div>
                                    <div className="mt-8 p-6 rounded-xl bg-green-50 border border-green-200">
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="text-xl">💡</span>Insider Hotel Tips for {venue.name}</h4>
                                        <ul className="space-y-3 text-sm text-gray-700">
                                            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span>Ask for "tournament rate" when booking - some hotels offer 10-15% off</li>
                                            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span>Book hotels with kitchenettes for stays of 3+ nights to save on food</li>
                                            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span>Check drive time on Google Maps for Saturday morning (tournament traffic!)</li>
                                            <li className="flex items-start gap-2"><span className="text-green-600 mt-0.5">✓</span>Hotels with free breakfast save $50+/day for a family of 4</li>
                                        </ul>
                                    </div>
                                </Section>
                            )}

                            {restaurants.length > 0 && (
                                <Section id="restaurants" title="Where to Eat" icon="🍽️" description={`Family-tested restaurant picks near ${venue.name}`}>
                                    <div className="space-y-8">
                                        {restaurantsByCategory.breakfast.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100">🍳</span>Quick Breakfast<span className="text-sm font-normal text-gray-500">(Get to fields fast)</span></h3><div className="space-y-3">{restaurantsByCategory.breakfast.map((r) => (<RestaurantCard key={r.id} restaurant={r} />))}</div></div>)}
                                        {restaurantsByCategory.team_dinner.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">🍝</span>Team Dinners<span className="text-sm font-normal text-gray-500">(Groups welcome)</span></h3><div className="space-y-3">{restaurantsByCategory.team_dinner.map((r) => (<RestaurantCard key={r.id} restaurant={r} />))}</div></div>)}
                                        {restaurantsByCategory.quick.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">⚡</span>Quick Bites<span className="text-sm font-normal text-gray-500">(Between games)</span></h3><div className="space-y-3">{restaurantsByCategory.quick.map((r) => (<RestaurantCard key={r.id} restaurant={r} />))}</div></div>)}
                                        {restaurantsByCategory.grocery.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">🛒</span>Grocery & Supplies<span className="text-sm font-normal text-gray-500">(Stock the cooler)</span></h3><div className="space-y-3">{restaurantsByCategory.grocery.map((r) => (<RestaurantCard key={r.id} restaurant={r} />))}</div></div>)}
                                        {restaurantsByCategory.other.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">🍽️</span>More Options</h3><div className="space-y-3">{restaurantsByCategory.other.map((r) => (<RestaurantCard key={r.id} restaurant={r} />))}</div></div>)}
                                    </div>
                                </Section>
                            )}

                            {tips.length > 0 && (
                                <Section id="tips" title="Tips from Tournament Parents" icon="💡" description="Real advice from families who've played here">
                                    <div className="space-y-8">
                                        {tipsByCategory.parking.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4">🅿️ Parking Tips</h3><div className="space-y-3">{tipsByCategory.parking.map((tip) => (<TipCard key={tip.id} tip={tip} />))}</div></div>)}
                                        {tipsByCategory.what_to_bring.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4">🎒 What to Bring</h3><div className="space-y-3">{tipsByCategory.what_to_bring.map((tip) => (<TipCard key={tip.id} tip={tip} />))}</div></div>)}
                                        {tipsByCategory.weather.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4">🌤️ Weather Tips</h3><div className="space-y-3">{tipsByCategory.weather.map((tip) => (<TipCard key={tip.id} tip={tip} />))}</div></div>)}
                                        {tipsByCategory.general.length > 0 && (<div><h3 className="text-lg font-bold text-gray-900 mb-4">💡 Good to Know</h3><div className="space-y-3">{tipsByCategory.general.map((tip) => (<TipCard key={tip.id} tip={tip} />))}</div></div>)}
                                    </div>
                                </Section>
                            )}

                            {faqs.length > 0 && (
                                <Section id="faq" title="Frequently Asked Questions" icon="❓" description={`Common questions about ${venue.name}`}>
                                    <FaqSection faqs={faqs} />
                                </Section>
                            )}
                        </div>

                        <aside className="space-y-6">
                            <div className="sticky top-24 space-y-6">
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-4 text-lg">📋 Quick Facts</h3>
                                    <dl className="space-y-4">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100"><dt className="text-gray-500">Location</dt><dd className="font-semibold text-gray-900">{venue.city}, {venue.state}</dd></div>
                                        {venue.fields && (<div className="flex justify-between items-center py-2 border-b border-gray-100"><dt className="text-gray-500">Fields</dt><dd className="font-semibold text-gray-900">{venue.fields}</dd></div>)}
                                        {venue.surface && (<div className="flex justify-between items-center py-2 border-b border-gray-100"><dt className="text-gray-500">Surface</dt><dd className="font-semibold text-gray-900 capitalize">{venue.surface}</dd></div>)}
                                        {hotels.length > 0 && (<div className="flex justify-between items-center py-2"><dt className="text-gray-500">Nearby Hotels</dt><dd className="font-semibold text-green-600">{hotels.length}</dd></div>)}
                                    </dl>
                                    <div className="mt-6 space-y-3">
                                        {hotels.length > 0 && (<a href="#hotels" className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors">🏨 Find Hotels</a>)}
                                        {venue.address && (<a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">📍 Get Directions</a>)}
                                    </div>
                                </div>

                                {relatedVenues.length > 0 && (
                                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-4">More {state.name} Venues</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {relatedVenues.map((v) => (<RelatedVenueCard key={v.id} venue={v} stateSlug={stateSlug} sportSlug={sportSlug} />))}
                                        </div>
                                        <Link href={`/${stateSlug}/${sportSlug}/venues`} className="mt-4 block text-center text-sm font-semibold text-green-600 hover:text-green-700">View All {state.name} Venues →</Link>
                                    </div>
                                )}

                                <div className="rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 p-6 text-white">
                                    <h3 className="font-bold text-lg mb-2">📧 Get Tournament Travel Tips</h3>
                                    <p className="text-sm text-green-100 mb-4">Join 5,000+ tournament families for hotel deals and insider tips.</p>
                                    <Link href="/newsletter" className="block w-full rounded-lg bg-white px-4 py-3 text-center text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors">Subscribe Free →</Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>

                <section className="bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-16 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="text-3xl font-bold text-white">Explore More {state.name} Venues</h2>
                        <p className="mt-4 text-lg text-green-100">Find hotels and travel guides for all {sport.name.toLowerCase()} tournament venues in {state.name}.</p>
                        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={`/${stateSlug}/${sportSlug}/venues`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-green-700 hover:bg-green-50 transition-colors">View All {state.name} Venues</Link>
                            <Link href="/venues" className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-800/50 px-8 py-4 font-semibold text-white hover:bg-green-800/70 transition-colors">Browse All States</Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </>
    );
}