require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const options = {
    headless: "new",
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ],
};

const getItems = async() => {
    try {
        const jsonString = await fs.readFile('input.json', 'utf8');
        return JSON.parse(jsonString);
    } catch (err) {
        console.error("Error reading file:", err);
        return null;
    }
};

const getUrls = async() => {
    try {
        let sources = await getItems();
        const browser = await puppeteer.launch(options);
        const page = await browser.newPage();
        const selector = process.env.SELECTOR;
        let urls = [];
        for (let i = 0; i < sources.length; i++) {            
            await page.goto(sources[i][process.env.KEY]);
            let hrefs = await page.evaluate((selector) => {
                let href = document.querySelector(selector);
                return href.innerText;
            }, selector);
            urls.push(hrefs);
        }
        return urls;
    }
    catch (err) {
        console.log(err);
    }
};

console.log(`> Lancement du script\n-> Variables d'environnement:\n• KEY :  ${process.env.KEY}\n• SELECTOR : ${process.env.SELECTOR}`)
getUrls()
    .then(async (urls) => {
        try {
            await fs.writeFile('output.json', JSON.stringify(urls, null, 2));
            console.log(`-> Script terminé, ${urls.length} Urls trouvé !\n`);
            process.exit(0);
        } catch (err) {
            console.error('-> Erreur lors de l\'écriture du fichier:', err);
        }
    })
    .catch(err => console.log(err));
