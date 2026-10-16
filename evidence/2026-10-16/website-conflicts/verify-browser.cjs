// Optional browser verification: provide Playwright via PLAYWRIGHT_MODULE or node resolution.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const results=[];
  for (const width of [390,1280]) {
    const page=await browser.newPage({viewport:{width,height:844}});
    await page.goto(process.env.REVIEW_ORIGIN || 'http://127.0.0.1:8793/');
    const row=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
      panelHidden:document.querySelector('#cx-panel').hidden,
      panelDisplay:getComputedStyle(document.querySelector('#cx-panel')).display}));
    if (row.width!==row.scrollWidth || !row.panelHidden || row.panelDisplay!=='none') throw new Error(JSON.stringify(row));
    await page.screenshot({path:path.join(__dirname,`portfolio-${width}.png`)});
    await page.locator('#cx-launcher').click();
    await page.locator('#cx-panel').waitFor({state:'visible'});
    await page.locator('#cx-close').click();
    await page.locator('#cx-panel').waitFor({state:'hidden'});
    row.openClose='passed (no messages submitted)';
    results.push(row); await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname,'browser-checks.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results));
})().catch(e=>{console.error(e);process.exit(1)});
