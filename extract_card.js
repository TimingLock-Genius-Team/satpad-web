const fs = require('fs');

async function main() {
    const puppeteer = require('puppeteer');
    const path = require('path');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const filePath = path.resolve('Eulr-demo.html');
    await page.goto(`file://${filePath}`, { waitUntil: 'networkidle0' });

    // Wait a bit for JS to render
    await new Promise(r => setTimeout(r, 2000));

    await page.screenshot({ path: 'demo_screenshot.png' });
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    fs.writeFileSync('demo_body.html', bodyHTML);

    console.log("Screenshot saved to demo_screenshot.png and body HTML to demo_body.html");

    await browser.close();
}

main().catch(console.error);