const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateVenueContent(venue) {
    const prompt = `You are a helpful travel writer and researcher creating content for a youth baseball tournament travel website. Generate comprehensive, parent-friendly content for the following venue.

VENUE INFORMATION:
- Name: ${venue.name}
- City: ${venue.city}, ${venue.state}
- Address: ${venue.address || "UNKNOWN - please research"}
- Fields: ${venue.fields || "UNKNOWN - please research"}
- Surface: ${venue.surface || "UNKNOWN - please research"}

IMPORTANT: If address, fields, or surface are marked as UNKNOWN, please research and provide your best estimate based on your knowledge of this facility. For fields, provide a number. For surface, use one of: "turf", "grass", or "mixed".

Generate the following sections. Write in a warm, helpful tone as if you're a fellow baseball parent sharing insider knowledge. Be specific and practical. Each section should be 150-250 words.

1. OVERVIEW: What makes this venue special? Why do tournament families come here? What should they know upfront?

2. WHAT TO EXPECT: Describe the facility layout, field conditions, typical tournament operations, parking, amenities, and what a typical tournament day looks like.

3. WHERE TO STAY: Recommend hotel options at different price points within 15-20 minutes of the venue. Include specific hotel names if you know them, or describe the types of accommodations available in the area. Mention if vacation rentals are a good option.

4. WHERE TO EAT: Recommend restaurants for tournament families - quick breakfast spots, casual family dinners, local favorites, and any on-site concession information.

5. THINGS TO DO: What can families do between games or on off days? Include both indoor and outdoor activities, considering Florida weather.

6. PRO TIPS: List 5-7 specific, actionable tips that would help a first-time visitor to this venue. Format as a JSON array of strings.

7. META_TITLE: Create an SEO-friendly page title (under 60 characters)

8. META_DESCRIPTION: Create an SEO-friendly meta description (under 160 characters)

9. VENUE DETAILS: Research and provide the following if not already known:
   - fields_count: Number of baseball/softball fields (integer, or null if truly unknown)
   - address: Full street address with zip code (string, or null if truly unknown)
   - surface_type: "turf", "grass", or "mixed" (or null if truly unknown)

Respond in this exact JSON format:
{
    "overview": "...",
    "what_to_expect": "...",
    "where_to_stay": "...",
    "where_to_eat": "...",
    "things_to_do": "...",
    "pro_tips": ["tip 1", "tip 2", ...],
    "meta_title": "...",
    "meta_description": "...",
    "venue_details": {
        "fields_count": 6,
        "address": "123 Main St, City, FL 12345",
        "surface_type": "turf"
    }
}

Only respond with valid JSON, no other text. For venue_details, only include values you are reasonably confident about - use null for anything uncertain.`;

    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2500,
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const responseText = message.content[0].text;

        // Parse JSON response
        const content = JSON.parse(responseText);

        return {
            success: true,
            content: {
                overview: content.overview,
                what_to_expect: content.what_to_expect,
                where_to_stay: content.where_to_stay,
                where_to_eat: content.where_to_eat,
                things_to_do: content.things_to_do,
                pro_tips: content.pro_tips,
                meta_title: content.meta_title,
                meta_description: content.meta_description,
                venue_details: content.venue_details || {},
            },
        };
    } catch (error) {
        console.error("Error generating content:", error);
        return {
            success: false,
            error: error.message,
        };
    }
}

async function generateAndSaveVenueContent(pool, venueId) {
    // Get venue
    const venueResult = await pool.query(
        "SELECT * FROM venues WHERE id = $1 OR slug = $1",
        [venueId]
    );

    if (venueResult.rows.length === 0) {
        return { success: false, error: "Venue not found" };
    }

    const venue = venueResult.rows[0];

    // Check if content already exists
    if (venue.overview && venue.what_to_expect) {
        return {
            success: false,
            error: "Venue already has content.",
            venue: venue.name
        };
    }

    console.log(`Generating content for: ${venue.name}`);

    const result = await generateVenueContent(venue);

    if (!result.success) {
        return result;
    }

    const { venue_details } = result.content;

    // Build dynamic update query - only update fields that are missing
    const updates = [];
    const values = [];
    let paramCount = 0;

    // Always update content fields
    updates.push(`overview = $${++paramCount}`);
    values.push(result.content.overview);

    updates.push(`what_to_expect = $${++paramCount}`);
    values.push(result.content.what_to_expect);

    updates.push(`where_to_stay = $${++paramCount}`);
    values.push(result.content.where_to_stay);

    updates.push(`where_to_eat = $${++paramCount}`);
    values.push(result.content.where_to_eat);

    updates.push(`things_to_do = $${++paramCount}`);
    values.push(result.content.things_to_do);

    updates.push(`pro_tips = $${++paramCount}`);
    values.push(JSON.stringify(result.content.pro_tips));

    updates.push(`meta_title = $${++paramCount}`);
    values.push(result.content.meta_title);

    updates.push(`meta_description = $${++paramCount}`);
    values.push(result.content.meta_description);

    // Only update venue details if they were missing AND AI provided them
    if (!venue.fields && venue_details?.fields_count) {
        updates.push(`fields = $${++paramCount}`);
        values.push(venue_details.fields_count);
        console.log(`  → Adding fields: ${venue_details.fields_count}`);
    }

    if (!venue.address && venue_details?.address) {
        updates.push(`address = $${++paramCount}`);
        values.push(venue_details.address);
        console.log(`  → Adding address: ${venue_details.address}`);
    }

    if (!venue.surface && venue_details?.surface_type) {
        updates.push(`surface = $${++paramCount}`);
        values.push(venue_details.surface_type);
        console.log(`  → Adding surface: ${venue_details.surface_type}`);
    }

    updates.push(`content_generated_at = CURRENT_TIMESTAMP`);
    updates.push(`content_generated_by = 'claude'`);

    // Add venue id as final param
    values.push(venue.id);

    const query = `UPDATE venues SET ${updates.join(', ')} WHERE id = $${paramCount + 1}`;

    await pool.query(query, values);

    return {
        success: true,
        venue: venue.name,
        content: result.content,
        updated_details: {
            fields: !venue.fields && venue_details?.fields_count ? venue_details.fields_count : null,
            address: !venue.address && venue_details?.address ? venue_details.address : null,
            surface: !venue.surface && venue_details?.surface_type ? venue_details.surface_type : null,
        }
    };
}

async function generateContentForAllVenues(pool, options = {}) {
    const { limit = 10 } = options;

    // ONLY get venues without content
    const venuesResult = await pool.query(`
        SELECT * FROM venues 
        WHERE overview IS NULL OR overview = ''
        ORDER BY name
        LIMIT $1
    `, [limit]);

    const venues = venuesResult.rows;

    if (venues.length === 0) {
        return {
            processed: 0,
            success: 0,
            failed: 0,
            message: "All venues already have content",
            venues: [],
        };
    }

    console.log(`Found ${venues.length} venues without content\n`);

    const results = {
        processed: 0,
        success: 0,
        failed: 0,
        details_filled: {
            fields: 0,
            address: 0,
            surface: 0,
        },
        venues: [],
    };

    for (const venue of venues) {
        console.log(`[${results.processed + 1}/${venues.length}] ${venue.name} (${venue.city})`);

        // Show what's missing
        const missing = [];
        if (!venue.fields) missing.push('fields');
        if (!venue.address) missing.push('address');
        if (!venue.surface) missing.push('surface');
        if (missing.length > 0) {
            console.log(`  Missing: ${missing.join(', ')}`);
        }

        try {
            const contentResult = await generateVenueContent(venue);

            if (contentResult.success) {
                const { venue_details } = contentResult.content;

                // Build update query
                const updates = [];
                const values = [];
                let paramCount = 0;

                updates.push(`overview = $${++paramCount}`);
                values.push(contentResult.content.overview);

                updates.push(`what_to_expect = $${++paramCount}`);
                values.push(contentResult.content.what_to_expect);

                updates.push(`where_to_stay = $${++paramCount}`);
                values.push(contentResult.content.where_to_stay);

                updates.push(`where_to_eat = $${++paramCount}`);
                values.push(contentResult.content.where_to_eat);

                updates.push(`things_to_do = $${++paramCount}`);
                values.push(contentResult.content.things_to_do);

                updates.push(`pro_tips = $${++paramCount}`);
                values.push(JSON.stringify(contentResult.content.pro_tips));

                updates.push(`meta_title = $${++paramCount}`);
                values.push(contentResult.content.meta_title);

                updates.push(`meta_description = $${++paramCount}`);
                values.push(contentResult.content.meta_description);

                // Track what details we're filling
                const filledDetails = [];

                if (!venue.fields && venue_details?.fields_count) {
                    updates.push(`fields = $${++paramCount}`);
                    values.push(venue_details.fields_count);
                    results.details_filled.fields++;
                    filledDetails.push(`fields=${venue_details.fields_count}`);
                }

                if (!venue.address && venue_details?.address) {
                    updates.push(`address = $${++paramCount}`);
                    values.push(venue_details.address);
                    results.details_filled.address++;
                    filledDetails.push(`address`);
                }

                if (!venue.surface && venue_details?.surface_type) {
                    updates.push(`surface = $${++paramCount}`);
                    values.push(venue_details.surface_type);
                    results.details_filled.surface++;
                    filledDetails.push(`surface=${venue_details.surface_type}`);
                }

                updates.push(`content_generated_at = CURRENT_TIMESTAMP`);
                updates.push(`content_generated_by = 'claude'`);

                values.push(venue.id);

                const query = `UPDATE venues SET ${updates.join(', ')} WHERE id = $${paramCount + 1}`;
                await pool.query(query, values);

                results.success++;
                results.venues.push({
                    name: venue.name,
                    city: venue.city,
                    status: "success",
                    details_added: filledDetails
                });

                console.log(`  ✓ Content saved${filledDetails.length > 0 ? ` + ${filledDetails.join(', ')}` : ''}`);
            } else {
                results.failed++;
                results.venues.push({
                    name: venue.name,
                    city: venue.city,
                    status: "failed",
                    error: contentResult.error
                });
                console.log(`  ✗ Failed: ${contentResult.error}`);
            }
        } catch (error) {
            results.failed++;
            results.venues.push({
                name: venue.name,
                city: venue.city,
                status: "failed",
                error: error.message
            });
            console.log(`  ✗ Error: ${error.message}`);
        }

        results.processed++;

        // Rate limiting - wait 1 second between API calls
        if (results.processed < venues.length) {
            await new Promise((r) => setTimeout(r, 1000));
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Complete: ${results.success}/${results.processed} successful`);
    console.log(`Details filled: ${results.details_filled.fields} fields, ${results.details_filled.address} addresses, ${results.details_filled.surface} surfaces`);

    return results;
}

module.exports = {
    generateVenueContent,
    generateAndSaveVenueContent,
    generateContentForAllVenues,
};