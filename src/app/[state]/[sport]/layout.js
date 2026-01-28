export const metadata = {
    title: {
        template: "%s | Florida Baseball Venues Guide",
        default: "Florida Baseball Venues | Complete Tournament Guide for Travel Baseball Families",
    },
    description:
        "Discover the best baseball tournament venues across Florida. Comprehensive guides with hotels, restaurants, activities, and insider tips for travel baseball families.",
    keywords: [
        "Florida baseball venues",
        "travel baseball Florida",
        "youth baseball tournaments",
        "baseball tournament venues",
        "USSSA Florida",
        "Perfect Game Florida",
        "Florida baseball fields",
        "travel ball Florida",
    ],
    openGraph: {
        title: "Florida Baseball Venues | Complete Tournament Guide",
        description:
            "The ultimate guide for travel baseball families. Find tournament venues, nearby hotels, restaurants, and activities across Florida.",
        type: "website",
        locale: "en_US",
        url: "https://yoursite.com/baseball",
        siteName: "Florida Baseball Venues Guide",
        images: [
            {
                url: "/og-florida-baseball.jpg",
                width: 1200,
                height: 630,
                alt: "Florida Baseball Venues Guide",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Florida Baseball Venues | Tournament Guide",
        description:
            "Complete guides to Florida's best baseball tournament venues for travel baseball families.",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function BaseballLayout({ children }) {
    return (
        <>
            {children}
        </>
    );
}