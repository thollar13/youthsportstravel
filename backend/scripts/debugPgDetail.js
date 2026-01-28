// debugPGDetail.js - Check what's on a specific tournament detail page
const puppeteer = require('puppeteer');

const GID = process.argv[2] || '22425'; // Default to the one that failed

async function debug() {
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

        const url = `https://www.perfectgame.org/Schedule/GroupedEvents.aspx?gid=${GID}`;
        console.log(`Fetching: ${url}\n`);

        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise(r => setTimeout(r, 3000));

        const pageInfo = await page.evaluate(() => {
            const text = document.body?.innerText || '';
            const html = document.body?.innerHTML || '';

            return {
                title: document.title,
                textLength: text.length,

                // Look for venue patterns
                hasBoombah: /BOOMBAH/i.test(text),
                hasLakeMyrtle: /Lake\s*Myrtle/i.test(text),
                hasSportsComplex: /Sports\s*Complex/i.test(text),
                hasBallpark: /Ballpark/i.test(text),
                hasStadium: /Stadium/i.test(text),

                // Look for city/location
                cityMatches: text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*FL/gi)?.slice(0, 5),

                // Look for entry fee
                entryFeeMatch: text.match(/Entry\s*Fee[:\s]*\$?[\d,]+/i)?.[0],
                feeMatch: text.match(/\$[\d,]+/g)?.slice(0, 5),

                // Sample of text (first 3000 chars)
                textSample: text.substring(0, 3000),

                // Look for specific sections
                hasEventInfo: /Event\s*Info/i.test(text),
                hasLocation: /Location/i.test(text),
                hasVenue: /Venue/i.test(text),
            };
        });

        console.log('Page Title:', pageInfo.title);
        console.log('Text Length:', pageInfo.textLength);
        console.log('\n--- Venue Detection ---');
        console.log('Has BOOMBAH:', pageInfo.hasBoombah);
        console.log('Has Lake Myrtle:', pageInfo.hasLakeMyrtle);
        console.log('Has Sports Complex:', pageInfo.hasSportsComplex);
        console.log('Has Ballpark:', pageInfo.hasBallpark);
        console.log('Has Stadium:', pageInfo.hasStadium);

        console.log('\n--- Location/City ---');
        console.log('City matches:', pageInfo.cityMatches);
        console.log('Has Location section:', pageInfo.hasLocation);
        console.log('Has Venue section:', pageInfo.hasVenue);

        console.log('\n--- Fees ---');
        console.log('Entry fee match:', pageInfo.entryFeeMatch);
        console.log('Fee patterns:', pageInfo.feeMatch);

        console.log('\n--- Text Sample ---');
        console.log(pageInfo.textSample);

        // Save full text
        const fullText = await page.evaluate(() => document.body?.innerText || '');
        require('fs').writeFileSync('/tmp/pg-detail.txt', fullText);
        console.log('\n\nFull text saved to /tmp/pg-detail.txt');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (browser) await browser.close();
    }
}

debug();