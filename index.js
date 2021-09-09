import fs from 'fs';
import puppeteer from 'puppeteer';

const url = 'https://medium.com'; //URL you want to target
const itemsCount = 100; //Number items you want in results

//Extracts urls and return list of {domain, referece_count, sources}
function extractItems() {
    const extractedElements = document.querySelectorAll('.ay.az.ba.bb.bc.bd.be.bf.bg.bh.bi.bj.bk.bl.bm');
    const items = [];

    for (var element of extractedElements) {
        const href = element.getAttribute("href");
        if (href.includes('medium.com/?')) {
            const domain = href.split('?')[0];
            const source = href.split('?source=')[1];
            var found = -1;

            for (var i = 0; i < items.length; i++) {
                if(items[i].domain == domain) {
                    found = i;
                    break;
                }
            }
            if(found == -1){
                items.push({ domain: domain, reference_count:1, sources:source});
            } else {
                items[i].reference_count = items[i].reference_count+1;
                items[i].sources += ','+source;
            }  
        }
    }
    return items;
}

//Calls extractItems() till targetcount is achieved
async function scrapeInfiniteScrollItems(
    page,
    extractItems,
    itemTargetCount,
    scrollDelay = 1000,
) {
    var items = [];
    try {
        var previousHeight;
        while (items.length < itemTargetCount) {
            items = await page.evaluate(extractItems);
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitForTimeout(scrollDelay);
        }
    } catch (e) { }
    return items;
}

// IIFE
(async () => {

    // Sets up browser and page.
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    // Navigates to the demo page.
    await page.goto(url);

    // Scrolls and extracts items from the page.
    const items = await scrapeInfiniteScrollItems(page, extractItems, itemsCount);
    
    var topDomain = {domain: "", reference_count:0};
    var topSource = {source:"", count:0};

    // Formats extracted items and finds top domain
    const result = items.map((item)=>{
        if (item.reference_count > topDomain.reference_count) {
            topDomain = {
                domain: item.domain,
                reference_count:item.reference_count
            }
        }

        //Converts sources from string to array
        item.sources = item.sources.split(',');
        
        //Converts array of sources to object with their count
        var sourcesObject = item.sources.reduce(function (obj, b) {
            obj[b] = ++obj[b] || 1;
            if(obj[b] > topSource.count) {
                topSource = { 
                    source: b, count: obj[b] 
                };
            }
            return obj;
        }, {});
        item.sources = sourcesObject;
        return item;
    })

    // Saves extracted results to a file.
    fs.writeFile("results/results.json", JSON.stringify(result, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Results was saved!");
    });
    fs.writeFile("results/top-domain.json", JSON.stringify(topDomain, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Top Domain was found and saved!");
    });
    fs.writeFile("results/top-source.json", JSON.stringify(topSource, null, 4), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Top Source was found and saved!");
    });

    // Closes the browser.
    await browser.close();
})();
