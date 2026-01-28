// services/geocoding.js
// Google Geocoding service for converting addresses/zips to coordinates
// Supports both Geocoding API and Places API

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

// Set to 'places' to use Places API, or 'geocoding' for Geocoding API
const API_MODE = process.env.GOOGLE_GEO_MODE || 'geocoding';

/**
 * Geocode a zip code using Google Geocoding API
 */
async function geocodeWithGeocodingAPI(zipCode) {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&components=country:US&key=${GOOGLE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results.length) {
        console.error(`Geocoding API failed for zip ${zipCode}:`, data.status, data.error_message || '');
        return null;
    }

    const result = data.results[0];
    const location = result.geometry.location;

    let city = '';
    let state = '';

    for (const component of result.address_components) {
        if (component.types.includes('locality')) {
            city = component.long_name;
        }
        if (component.types.includes('administrative_area_level_1')) {
            state = component.short_name;
        }
    }

    return {
        lat: location.lat,
        lng: location.lng,
        city,
        state,
        formattedAddress: result.formatted_address
    };
}

/**
 * Geocode a zip code using Google Places API (Find Place)
 */
async function geocodeWithPlacesAPI(zipCode) {
    // Step 1: Find the place
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${zipCode}&inputtype=textquery&fields=place_id,formatted_address,geometry,address_components&key=${GOOGLE_API_KEY}`;
    const findResponse = await fetch(findUrl);
    const findData = await findResponse.json();

    if (findData.status !== 'OK' || !findData.candidates?.length) {
        console.error(`Places API failed for zip ${zipCode}:`, findData.status, findData.error_message || '');
        return null;
    }

    const candidate = findData.candidates[0];

    // If we got geometry directly, use it
    if (candidate.geometry?.location) {
        let city = '';
        let state = '';

        // Parse address components if available
        if (candidate.address_components) {
            for (const component of candidate.address_components) {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                }
            }
        } else {
            // Parse from formatted address (e.g., "Tallahassee, FL 32317, USA")
            const parts = candidate.formatted_address?.split(',') || [];
            if (parts.length >= 2) {
                city = parts[0].trim();
                const stateZip = parts[1].trim().split(' ');
                state = stateZip[0];
            }
        }

        return {
            lat: candidate.geometry.location.lat,
            lng: candidate.geometry.location.lng,
            city,
            state,
            formattedAddress: candidate.formatted_address
        };
    }

    // Step 2: If no geometry, get place details
    if (candidate.place_id) {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${candidate.place_id}&fields=geometry,address_components,formatted_address&key=${GOOGLE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status === 'OK' && detailsData.result?.geometry?.location) {
            const result = detailsData.result;
            let city = '';
            let state = '';

            for (const component of result.address_components || []) {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                }
            }

            return {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                city,
                state,
                formattedAddress: result.formatted_address
            };
        }
    }

    return null;
}

/**
 * Geocode a zip code to get lat/lng coordinates
 * @param {string} zipCode - 5-digit US zip code
 * @returns {Promise<{lat: number, lng: number, city: string, state: string} | null>}
 */
async function geocodeZipCode(zipCode) {
    if (!GOOGLE_API_KEY) {
        console.error('GOOGLE_MAPS_API_KEY or GOOGLE_PLACES_API_KEY not set');
        return null;
    }

    try {
        if (API_MODE === 'places') {
            return await geocodeWithPlacesAPI(zipCode);
        } else {
            return await geocodeWithGeocodingAPI(zipCode);
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Geocode an address (city, state or full address)
 * @param {string} address - Address to geocode
 * @returns {Promise<{lat: number, lng: number} | null>}
 */
async function geocodeAddress(address) {
    if (!GOOGLE_API_KEY) {
        console.error('GOOGLE_MAPS_API_KEY not set');
        return null;
    }

    try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.results.length) {
            console.error(`Geocoding failed for address "${address}":`, data.status);
            return null;
        }

        const location = data.results[0].geometry.location;
        return {
            lat: location.lat,
            lng: location.lng,
            formattedAddress: data.results[0].formatted_address
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
}

/**
 * Simple in-memory cache for zip code lookups (reduces API calls)
 */
const zipCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function geocodeZipCodeCached(zipCode) {
    const cached = zipCache.get(zipCode);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const result = await geocodeZipCode(zipCode);
    if (result) {
        zipCache.set(zipCode, { data: result, timestamp: Date.now() });
    }
    return result;
}

module.exports = {
    geocodeZipCode,
    geocodeZipCodeCached,
    geocodeAddress
};