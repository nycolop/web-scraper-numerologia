const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TARGET_URL = 'https://meditaluz.com.mx/numerologia-angelical/';

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setDefaultTimeout(120000); // 60 segundos

    // Navigate the page to a URL
    await page.goto(TARGET_URL);

    // Set screen size
    await page.setViewport({ width: 1080, height: 1024 });

    //   // Type into search box
    //   await page.type('.devsite-search-field', 'automate beyond recorder');

    //   // Wait and click on first result
    //   const searchResultSelector = '.devsite-result-item-link';
    //   await page.waitForSelector(searchResultSelector);
    //   await page.click(searchResultSelector);

    // Locate the full title with a unique string
    // const textSelector = await page.waitForSelector(
    // 'text/Customize and automate'
    // );
    // const fullTitle = await textSelector?.evaluate(el => el.textContent);

    // Print the full title
    // console.log('The title of this blog post is "%s".', /fullTitle);

    // Algorithm
    async function generateCombinations(values, depth) {
        let combinations = [];

        async function helper(currentCombination, currentDepth) {
            if (currentDepth === depth) {
                const selectorInput = await page.waitForSelector('body > div.wrapper.default > div.main > article > div > div > div > section:nth-child(2) > div > div > div > div > div > div > div > iframe', {
                    visible: true
                });
            
                const iframe = await selectorInput.contentFrame();
                const bodyIframe = await iframe.waitForSelector('body');
            
                const primerDigito = await bodyIframe.waitForSelector('[name=cuartodigito]');
                const segundoDigito = await bodyIframe.waitForSelector('[name=tercerdigito]');
                const tercerDigito = await bodyIframe.waitForSelector('[name=segundodigito]');
                const cuartoDigito = await bodyIframe.waitForSelector('[name=primerdigito]');
                const submitButton = await bodyIframe.waitForSelector('button.btn.btn-lg.btn-primary.center-block[type="submit"]');

                await primerDigito.select(currentCombination[0]);
                await segundoDigito.select(currentCombination[1]);
                await tercerDigito.select(currentCombination[2]);
                await cuartoDigito.select(currentCombination[3]);
                await submitButton.click();
            
                const nextPageIframe = await page.waitForSelector('iframe');
                const nextPageInnerIframe = await nextPageIframe.contentFrame();
                const p =  await nextPageInnerIframe.waitForSelector('div.col-xs-12.col-md-6 > p');
                const text = await p.evaluate(el => el.textContent);
                
                await new Promise((resolve, reject) => {
                    fs.writeFile(path.resolve(__dirname, 'texts', `${currentCombination.join('')}.txt`), text, err => {
                        if (err) {
                          reject('err writing file')
                        } else {
                          resolve('ok writing file');
                        }
                    });
                });

                console.log('Page writing done: ' + currentCombination.join('') + '.txt');
                // combinations.push([...currentCombination]);
                return;
            }

            for (let value of values) {
                currentCombination[currentDepth] = value;
                await page.goto(TARGET_URL);
                await helper(currentCombination, currentDepth + 1);
            }
        }

        await helper([], 0);
        return combinations;
    }

    const values = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "-"];
    const depth = 4; // 4 campos
    const allCombinations = await generateCombinations(values, depth);

    // console.log(allCombinations);
    console.log('Total combinaciones:', allCombinations.length);

    // await browser.close();
})();