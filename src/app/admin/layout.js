"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdminAuthenticated, authenticateAdmin, logoutAdmin } from "@/lib/adminAuth";

function AdminNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: "📊" },
        { href: "/admin/venues", label: "Venues", icon: "🏟️" },
        { href: "/admin/hotels", label: "Hotels", icon: "🏨" },
        { href: "/admin/tournaments", label: "Tournaments", icon: "🏆" },
    ];

    const isActive = (href) => {
        if (href === "/admin") return pathname === "/admin";
        return pathname.startsWith(href);
    };

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white p-4">
            <div className="mb-8">
                <Link href="/admin" className="text-xl font-bold">
                    Admin Panel
                </Link>
            </div>

            <nav className="space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive(item.href)
                                ? "bg-green-600 text-white"
                                : "text-gray-300 hover:bg-gray-800 hover:text-white"
                            }`}
                    >
                        <span>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className="absolute bottom-4 left-4 right-4">
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
                >
                    ← Back to Site
                </Link>
                <button
                    onClick={() => {
                        logoutAdmin();
                        window.location.reload();
                    }}
                    className="mt-2 w-full rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors text-left"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}

function LoginForm() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const success = await authenticateAdmin(password);
        if (success) {
            window.location.reload();
        } else {
            setError("Invalid password");
            setPassword("");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Access</h1>
                        <p className="mt-1 text-sm text-gray-500">Enter password to continue</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            autoFocus
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 mb-4 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        />

                        {error && (
                            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700"
                        >
                            Access Admin
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function AdminLayout({ children }) {
    const [isAuthed, setIsAuthed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsAuthed(isAdminAuthenticated());
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
            </div>
        );
    }

    if (!isAuthed) {
        return <LoginForm />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <main className="ml-64 p-8">{children}</main>
        </div>
    );
}