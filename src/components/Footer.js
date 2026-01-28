import Link from "next/link";
import { SPORTS } from "@/lib/states";

export default function Footer({ popularStates = [] }) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 text-white">
                            <span className="text-2xl">⚾</span>
                            <span className="font-bold">Tournament Travel Guide</span>
                        </Link>
                        <p className="mt-4 text-sm text-gray-400 leading-relaxed">
                            Helping travel baseball and softball families plan their tournament trips with
                            confidence.
                        </p>
                    </div>

                    {/* Sports */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Sports
                        </h4>
                        <ul className="space-y-2">
                            {SPORTS.map((sport) => (
                                <li key={sport.slug}>
                                    <span className="text-sm text-gray-400 inline-flex items-center gap-2">
                                        {sport.icon} {sport.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Popular States */}
                    {popularStates.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                                Popular States
                            </h4>
                            <ul className="space-y-2">
                                {popularStates.slice(0, 6).map((state) => (
                                    <li key={state.code || state.slug}>
                                        <Link
                                            href={`/${state.slug}`}
                                            className="text-sm text-gray-400 hover:text-white transition-colors"
                                        >
                                            {state.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                            Quick Links
                        </h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/#states" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Browse by State
                                </Link>
                            </li>
                            <li>
                                <Link href="/hotels/add" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    Add a Hotel
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} Tournament Travel Guide. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
                            Privacy
                        </Link>
                        <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-400 transition-colors">
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}