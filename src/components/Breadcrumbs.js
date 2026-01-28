import Link from "next/link";

/**
 * Breadcrumbs Component
 * 
 * Usage:
 * <Breadcrumbs 
 *   items={[
 *     { label: "Home", href: "/" },
 *     { label: "Florida", href: "/florida" },
 *     { label: "Baseball", href: "/florida/baseball/venues" },
 *     { label: "Venue Name" }  // Last item has no href
 *   ]} 
 *   variant="light"  // or "dark"
 * />
 */
export default function Breadcrumbs({ items = [], variant = "dark" }) {
    const styles = {
        light: {
            link: "text-white/70 hover:text-white",
            current: "text-white font-medium",
            separator: "text-white/40",
        },
        dark: {
            link: "text-gray-500 hover:text-gray-700",
            current: "text-gray-900 font-medium",
            separator: "text-gray-400",
        },
    };

    const s = styles[variant] || styles.dark;

    return (
        <nav aria-label="Breadcrumb">
            <ol
                className="flex flex-wrap items-center gap-2 text-sm"
                itemScope
                itemType="https://schema.org/BreadcrumbList"
            >
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li
                            key={index}
                            className="flex items-center gap-2"
                            itemProp="itemListElement"
                            itemScope
                            itemType="https://schema.org/ListItem"
                        >
                            {item.href && !isLast ? (
                                <Link
                                    href={item.href}
                                    className={`transition-colors ${s.link}`}
                                    itemProp="item"
                                >
                                    <span itemProp="name">{item.label}</span>
                                </Link>
                            ) : (
                                <span className={s.current} itemProp="name">
                                    {item.label}
                                </span>
                            )}
                            <meta itemProp="position" content={String(index + 1)} />

                            {!isLast && (
                                <svg
                                    className={`h-4 w-4 ${s.separator}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}