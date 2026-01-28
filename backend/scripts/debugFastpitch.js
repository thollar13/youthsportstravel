require('dotenv').config();
const puppeteer = require('puppeteer');

async function debug() {
    // Pick a fastpitch event that failed
    const testUrls = [
        'https://flfastpitch.usssa.com/event/ice-crystal/',
        'https://flfastpitch.usssa.com/event/four-leaf-glovers/',
        'https://flfastpitch.usssa.com/event/softball-life/',
    ];

    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

    for (const testUrl of testUrls) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Loading: ${testUrl}`);
        console.log('='.repeat(60));

        await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(r => setTimeout(r, 2000));

        const pageData = await page.evaluate(() => {
            const text = document.body.innerText;
            const title = document.title;

            // Find all date-like patterns
            const datePatterns = [];

            // Look for any text with month names and numbers
            const monthRegex = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s+\d{1,2}[^a-zA-Z]*\d{4}/gi;
            let match;
            while ((match = monthRegex.exec(text)) !== null) {
                datePatterns.push(match[0]);
            }

            // Find Tournament Date section
            const tournamentDateMatch = text.match(/Tournament Date[\s\S]{0,100}/i);

            // Find all elements with short text that might be dates
            const dateElements = [];
            document.querySelectorAll('*').forEach(el => {
                const t = el.innerText?.trim();
                if (t && t.length < 100 && t.length > 5) {
                    if (t.match(/\d{4}/) && t.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)) {
                        dateElements.push(t);
                    }
                }
            });

            // Find city patterns  
            const cityPatterns = [];
            const cityRegex = /([A-Za-z\s]+),\s*(FL|Florida)/gi;
            while ((match = cityRegex.exec(text)) !== null) {
                cityPatterns.push(match[0]);
            }

            return {
                title,
                textPreview: text.substring(0, 3000),
                datePatterns: [...new Set(datePatterns)],
                tournamentDateSection: tournamentDateMatch ? tournamentDateMatch[0] : null,
                dateElements: [...new Set(dateElements)].slice(0, 10),
                cityPatterns: [...new Set(cityPatterns)],
            };
        });

        console.log('\n--- PAGE TITLE ---');
        console.log(pageData.title);

        console.log('\n--- TOURNAMENT DATE SECTION ---');
        console.log(pageData.tournamentDateSection);

        console.log('\n--- DATE PATTERNS FOUND ---');
        pageData.datePatterns.forEach(d => console.log(`  "${d}"`));

        console.log('\n--- DATE ELEMENTS ---');
        pageData.dateElements.forEach(d => console.log(`  "${d}"`));

        console.log('\n--- CITY PATTERNS ---');
        pageData.cityPatterns.forEach(c => console.log(`  "${c}"`));

        console.log('\n--- TEXT PREVIEW ---');
        console.log(pageData.textPreview);
    }

    await browser.close();
}

debug().catch(console.error);