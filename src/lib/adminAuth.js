// Simple admin authentication using localStorage and hashed password

const STORAGE_KEY = "admin_auth_token";

/**
 * Hash a string using SHA-256
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Check if user is authenticated
 */
export function isAdminAuthenticated() {
    if (typeof window === "undefined") return false;

    const storedHash = localStorage.getItem(STORAGE_KEY);
    const expectedHash = process.env.NEXT_PUBLIC_ADMIN_HASH;

    return storedHash && expectedHash && storedHash === expectedHash;
}

/**
 * Attempt to authenticate with password
 */
export async function authenticateAdmin(password) {
    const hash = await hashPassword(password);
    const expectedHash = process.env.NEXT_PUBLIC_ADMIN_HASH;

    // Debug - remove these console.logs after fixing
    console.log("Entered password:", password);
    console.log("Generated hash:", hash);
    console.log("Expected hash:", expectedHash);
    console.log("Match:", hash === expectedHash);

    if (hash === expectedHash) {
        localStorage.setItem(STORAGE_KEY, hash);
        return true;
    }

    return false;
}

/**
 * Log out admin
 */
export function logoutAdmin() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
}