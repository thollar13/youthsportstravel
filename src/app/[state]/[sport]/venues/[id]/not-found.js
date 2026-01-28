import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import Link from "next/link";

export default function NotFound() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
            <Navigation />
            <div className="text-center">
                <div className="mx-auto h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mb-8">
                    <svg
                        className="h-12 w-12 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>
                <h1 className="text-4xl font-bold text-gray-900">Venue Not Found</h1>
                <p className="mt-4 text-lg text-gray-600 max-w-md mx-auto">
                    We couldn't find the baseball venue you're looking for. It may have been moved or
                    doesn't exist.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/baseball"
                        className="inline-block rounded-lg bg-green-600 px-6 py-3 text-center font-semibold text-white transition-colors hover:bg-green-700"
                    >
                        Browse All Venues
                    </Link>
                    <Link
                        href="/"
                        className="inline-block rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
            <Footer />
        </main>
    );
}