"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SPORTS } from "@/lib/states";

export default function Navigation() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const isHome = pathname === "/";

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="font-bold text-gray-900 group-hover:text-green-700 transition-colors hidden sm:inline">
                            Youth Sports Travel
                        </span>
                        <span className="font-bold text-gray-900 sm:hidden">TTG</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex md:items-center md:gap-6">
                        <Link
                            href="/"
                            className={`text-sm font-medium transition-colors ${isHome ? "text-green-700" : "text-gray-600 hover:text-green-700"
                                }`}
                        >
                            Home
                        </Link>

                        <Link
                            href="/venues"
                            className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
                        >
                            Venues
                        </Link>

                        <Link
                            href="/guides"
                            className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
                        >
                            Guides
                        </Link>

                        <Link
                            href="/about"
                            className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
                        >
                            About
                        </Link>

                        <Link
                            href="/contact"
                            className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
                        >
                            Contact
                        </Link>

                        <Link
                            href="/#states"
                            className="text-sm font-medium text-gray-600 hover:text-green-700 transition-colors"
                        >
                            Browse by State
                        </Link>

                        {/* Sports indicators */}
                        {/* <div className="flex items-center gap-3 text-sm text-gray-400">
                            {SPORTS.map((sport) => (
                                <span key={sport.slug} className="flex items-center gap-1">
                                    {sport.icon} {sport.name}
                                </span>
                            ))}
                        </div> */}
                    </div>

                    {/* Mobile menu button */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                        aria-expanded={mobileMenuOpen}
                    >
                        <span className="sr-only">Toggle menu</span>
                        {mobileMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-gray-200 bg-white">
                    <div className="px-4 py-4 space-y-1">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block rounded-lg px-3 py-2 text-base font-medium ${isHome ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            Home
                        </Link>
                        <Link
                            href="/#states"
                            onClick={() => setMobileMenuOpen(false)}
                            className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Browse by State
                        </Link>

                        {/* <div className="border-t border-gray-200 my-2 pt-2">
                            <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Sports</p>
                            {SPORTS.map((sport) => (
                                <span key={sport.slug} className="block px-3 py-2 text-gray-500">
                                    {sport.icon} {sport.name}
                                </span>
                            ))}
                        </div> */}

                        <div className="border-t border-gray-200 my-2 pt-2">
                            <Link
                                href="/hotels/add"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                            >
                                + Add Hotel
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}