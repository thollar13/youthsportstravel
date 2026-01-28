"use client";

import { useState, useEffect } from "react";
import { isAdminAuthenticated, authenticateAdmin } from "@/lib/adminAuth";

export default function AdminGuard({ children }) {
    const [isAuthed, setIsAuthed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        setIsAuthed(isAdminAuthenticated());
        setIsLoading(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const success = await authenticateAdmin(password);
        if (success) {
            setIsAuthed(true);
        } else {
            setError("Invalid password");
            setPassword("");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-r-transparent"></div>
            </div>
        );
    }

    if (!isAuthed) {
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
                            <div className="mb-4">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    autoFocus
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                />
                            </div>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                            >
                                Access Admin
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return children;
}