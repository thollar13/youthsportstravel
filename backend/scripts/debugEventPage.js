require('dotenv').config();
const puppeteer = require('puppeteer');

async function debugEventPage() {
    const testUrl = 'https://flbaseball.usssa.com/event/easton-hype-tour-nit-battle-4-the-belts-2k26/';

    const browser = await puppeteer.launch({
        headless: false, // Show browser
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    console.log(`Loading: ${testUrl}\n`);
    await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));

    // Get page text and look for patterns
    const pageData = await page.evaluate(() => {
        const text = document.body.innerText;
        const html = document.body.innerHTML;

        // Find all instances of "FL" with context
        const flMatches = [];
        const flRegex = /.{0,50}FL.{0,20}/g;
        let match;
        while ((match = flRegex.exec(text)) !== null) {
            flMatches.push(match[0].trim());
        }

        // Find anything that looks like an address
        const addressMatches = [];
        const addressRegex = /[\w\s]+,\s*(?:FL|Florida)[\s\d]*/gi;
        while ((match = addressRegex.exec(text)) !== null) {
            addressMatches.push(match[0].trim());
        }

        // Find anything that looks like a venue
        const venueMatches = [];
        const venueRegex = /[\w\s\-'\.]+(?:Complex|Park|Field|Stadium|Center|Centre|Sportsplex)/gi;
        while ((match = venueRegex.exec(text)) !== null) {
            venueMatches.push(match[0].trim());
        }

        // Get all text that might contain location info
        const locationElements = [];
        document.querySelectorAll('*').forEach(el => {
            const t = el.innerText?.trim();
            if (t && t.length < 200 && (
                t.includes('FL') ||
                t.includes('Florida') ||
                t.includes('Complex') ||
                t.includes('Park') ||
                t.includes('Location')
            )) {
                locationElements.push(t);
            }
        });

        return {
            textLength: text.length,
            textPreview: text.substring(0, 2000),
            flMatches: [...new Set(flMatches)],
            addressMatches: [...new Set(addressMatches)],
            venueMatches: [...new Set(venueMatches)],
            locationElements: [...new Set(locationElements)].slice(0, 20)
        };
    });

    console.log('=== PAGE TEXT PREVIEW ===');
    console.log(pageData.textPreview);

    console.log('\n=== FL MATCHES ===');
    pageData.flMatches.forEach(m => console.log(`  "${m}"`));

    console.log('\n=== ADDRESS MATCHES ===');
    pageData.addressMatches.forEach(m => console.log(`  "${m}"`));

    console.log('\n=== VENUE MATCHES ===');
    pageData.venueMatches.forEach(m => console.log(`  "${m}"`));

    console.log('\n=== LOCATION ELEMENTS ===');
    pageData.locationElements.forEach(m => console.log(`  "${m}"`));

    await browser.close();
}

debugEventPage().catch(console.error);