"use client";

import { useState } from "react";
import Link from "next/link";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

// Contact reason options
const CONTACT_REASONS = [
    { value: "", label: "Select a reason..." },
    { value: "suggest-venue", label: "🏟️ Suggest a Venue" },
    { value: "suggest-hotel", label: "🏨 Suggest a Hotel" },
    { value: "share-tip", label: "💡 Share a Tip" },
    { value: "report-issue", label: "⚠️ Report an Issue" },
    { value: "feedback", label: "💬 General Feedback" },
    { value: "partnership", label: "🤝 Partnership Inquiry" },
    { value: "other", label: "📝 Other" },
];

// FAQ items
const FAQ_ITEMS = [
    {
        question: "How do I suggest a venue?",
        answer: "Use the form on this page and select 'Suggest a Venue' as your reason. Include the venue name, city, state, and any details you know about it (number of fields, surface type, etc.)."
    },
    {
        question: "How are hotels selected?",
        answer: "Our hotel picks come from real tournament family experiences. We prioritize proximity to the fields, value, cleanliness, and family-friendliness. We don't accept paid placements."
    },
    {
        question: "Can I contribute tips for a venue?",
        answer: "Absolutely! Select 'Share a Tip' in the form and tell us about the venue. Include parking tips, what to bring, restaurant recommendations, or anything else that would help families."
    },
    {
        question: "Is this site free?",
        answer: "Yes! TournamentStay is completely free for all tournament families. We're building this as a community resource."
    },
];

function FAQItem({ question, answer }) {
    return (
        <details className="group border-b border-gray-200 py-4">
            <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900 hover:text-green-700 transition-colors">
                {question}
                <svg className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </summary>
            <p className="mt-3 text-gray-600">{answer}</p>
        </details>
    );
}

function ContactCard({ icon, title, description, action, href }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl mb-4">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            {href ? (
                <a href={href} className="text-green-600 font-semibold hover:text-green-700 transition-colors text-sm">
                    {action} →
                </a>
            ) : (
                <span className="text-green-600 font-semibold text-sm">{action}</span>
            )}
        </div>
    );
}

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        reason: "",
        venue: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        // Simulate form submission
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setIsSubmitted(true);
            setFormData({ name: "", email: "", reason: "", venue: "", message: "" });
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const showVenueField = ["suggest-venue", "suggest-hotel", "share-tip"].includes(formData.reason);

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1529768167801-9173d94c2a42?w=1920&h=600&fit=crop"
                        alt="Baseball stadium"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/95 via-green-800/90 to-green-700/80" />
                </div>

                <div className="relative px-4 py-16 sm:py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Breadcrumb */}
                        <nav className="mb-8 flex items-center gap-2 text-sm text-green-200">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white font-medium">Contact</span>
                        </nav>

                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
                                Get in Touch
                            </h1>
                            <p className="mt-6 text-xl text-green-100">
                                Have a venue to suggest? Tips to share? Questions or feedback?
                                We'd love to hear from you.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Quick contact options */}
            <section className="px-4 py-12 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="mx-auto max-w-7xl">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ContactCard
                            icon="🏟️"
                            title="Suggest a Venue"
                            description="Know a tournament venue we should add?"
                            action="Use form below"
                        />
                        <ContactCard
                            icon="💡"
                            title="Share Tips"
                            description="Help families with your insider knowledge"
                            action="Use form below"
                        />
                        <ContactCard
                            icon="⚠️"
                            title="Report Issues"
                            description="Found incorrect or outdated info?"
                            action="Use form below"
                        />
                        <ContactCard
                            icon="📧"
                            title="Email Us"
                            description="Prefer email? Reach out directly"
                            action="hello@tournamentstay.com"
                            href="mailto:hello@tournamentstay.com"
                        />
                    </div>
                </div>
            </section>

            {/* Contact Form & FAQ */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid lg:grid-cols-5 gap-12">
                        {/* Form */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
                                <p className="text-gray-500 mb-8">Fill out the form below and we'll get back to you soon.</p>

                                {isSubmitted ? (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                                        <p className="text-gray-600 mb-6">
                                            Your message has been sent. We'll review it and get back to you if needed.
                                        </p>
                                        <button
                                            onClick={() => setIsSubmitted(false)}
                                            className="text-green-600 font-semibold hover:text-green-700 transition-colors"
                                        >
                                            Send another message →
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {error && (
                                            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
                                                {error}
                                            </div>
                                        )}

                                        <div className="grid sm:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Your Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                    placeholder="John Smith"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address *
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                                Reason for Contact *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    id="reason"
                                                    name="reason"
                                                    required
                                                    value={formData.reason}
                                                    onChange={handleChange}
                                                    className="w-full appearance-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                >
                                                    {CONTACT_REASONS.map(option => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <svg className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>

                                        {showVenueField && (
                                            <div>
                                                <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                                                    Venue Name & Location
                                                </label>
                                                <input
                                                    type="text"
                                                    id="venue"
                                                    name="venue"
                                                    value={formData.venue}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                    placeholder="e.g., Grand Park, Westfield, Indiana"
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                required
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange}
                                                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 resize-none"
                                                placeholder="Tell us more..."
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-8 py-3 font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    Send Message
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* FAQ Sidebar */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm sticky top-24">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                                <div className="space-y-0">
                                    {FAQ_ITEMS.map((item, index) => (
                                        <FAQItem key={index} question={item.question} answer={item.answer} />
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-500 mb-3">Have more questions?</p>
                                    <Link
                                        href="/guides"
                                        className="text-green-600 font-semibold hover:text-green-700 transition-colors text-sm"
                                    >
                                        Check out our guides →
                                    </Link>
                                </div>
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
                            Ready to Find Your Next Tournament Stay?
                        </h2>
                        <p className="text-green-100 mb-8 max-w-xl mx-auto">
                            Browse our venue guides to find hotels, restaurants, and insider tips for your next trip.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/venues"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-4 font-semibold text-green-700 hover:bg-green-50 transition-colors"
                            >
                                Browse Venues
                            </Link>
                            <Link
                                href="/guides"
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-700/50 px-8 py-4 font-semibold text-white hover:bg-green-700/70 transition-colors"
                            >
                                Read Our Guides
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}