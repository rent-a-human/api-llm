import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    page.on('response', response => {
        if ([301, 302, 303, 307, 308].includes(response.status())) {
            console.log(`Redirect detected: ${response.url()} -> ${response.headers()['location']}`);
        }
    });

    console.log("Navigating to agent site...");
    try {
        await page.goto("https://rent-a-human.github.io/agent/", { waitUntil: 'load', timeout: 15000 });
        console.log("Navigation finished.");
    } catch (e) {
        console.error("Navigation error:", e);
    }
    
    const finalUrl = page.url();
    console.log("Final URL:", finalUrl);
    
    const title = await page.title();
    console.log("Page Title:", title);
    
    console.log("Fetching content...");
    const html = await page.content();
    console.log("Got content of length:", html.length);
    await browser.close();
    
    const { JSDOM } = await import('jsdom');
    const { Readability } = await import('@mozilla/readability');
    
    console.log("Parsing JSDOM...");
    const doc = new JSDOM(html, { url: finalUrl });
    console.log("Parsing Readability...");
    const reader = new Readability(doc.window.document);
    const article = reader.parse();
    console.log("Readability result:", !!article);
})();
