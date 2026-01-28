"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        venues: 0,
        hotels: 0,
        tournaments: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [venuesRes, hotelsRes, tournamentsRes] = await Promise.all([
                    fetch(`${API_URL}/api/venues`),
                    fetch(`${API_URL}/api/hotels`),
                    fetch(`${API_URL}/api/tournaments?limit=1000`),
                ]);

                const venuesData = await venuesRes.json();
                const hotelsData = await hotelsRes.json();
                const tournamentsData = await tournamentsRes.json();

                setStats({
                    venues: venuesData.venues?.length || 0,
                    hotels: hotelsData.hotels?.length || 0,
                    tournaments: tournamentsData.tournaments?.length || 0,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        {
            label: "Venues",
            count: stats.venues,
            href: "/admin/venues",
            icon: "🏟️",
            color: "bg-blue-500",
            addHref: "/admin/venues/add",
        },
        {
            label: "Hotels",
            count: stats.hotels,
            href: "/admin/hotels",
            icon: "🏨",
            color: "bg-green-500",
            addHref: "/admin/hotels/add",
        },
        {
            label: "Tournaments",
            count: stats.tournaments,
            href: "/admin/tournaments",
            icon: "🏆",
            color: "bg-purple-500",
            addHref: "/admin/tournaments/add",
        },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 rounded-xl bg-gray-200 animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <div
                            key={card.label}
                            className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                        >
                            <div className={`${card.color} px-6 py-4`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl">{card.icon}</span>
                                    <span className="text-4xl font-bold text-white">{card.count}</span>
                                </div>
                                <p className="mt-1 text-white/80 font-medium">{card.label}</p>
                            </div>
                            <div className="px-6 py-4 flex gap-3">
                                <Link
                                    href={card.href}
                                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    View All
                                </Link>
                                <Link
                                    href={card.addHref}
                                    className="flex-1 rounded-lg bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
                                >
                                    + Add New
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Actions */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/admin/hotels/generate"
                        className="rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300 hover:shadow-md transition-all"
                    >
                        <span className="text-2xl">✨</span>
                        <h3 className="mt-2 font-semibold text-gray-900">Generate Hotels</h3>
                        <p className="mt-1 text-sm text-gray-500">Auto-create hotels for a venue</p>
                    </Link>
                    <Link
                        href="/admin/tournaments"
                        className="rounded-xl border border-gray-200 bg-white p-4 hover:border-green-300 hover:shadow-md transition-all"
                    >
                        <span className="text-2xl">🔄</span>
                        <h3 className="mt-2 font-semibold text-gray-900">Scrape Tournaments</h3>
                        <p className="mt-1 text-sm text-gray-500">Fetch latest tournaments</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}