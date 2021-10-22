const fs = require('fs');
const puppeteer = require('puppeteer');
const pages = require('./pages.json');

process.setMaxListeners(0);

let mails;

const mailsFilePath = './mails.txt';

if (fs.existsSync(mailsFilePath)) {
	fs.unlink(mailsFilePath, (err) => {
		if (err) {
			console.log(err);
		}
	})
}

const writeStream = fs.createWriteStream('mails.txt');
const pathName = writeStream.path;

(async() => {
	const browser = await puppeteer.launch({
		headless: true
	});
	const [page] = await browser.pages();

	for (let i = 0 ; i < pages.length ; i++) {
		console.log(`Page(s) testées : ${i}`);
		const pageUrl = pages[i].URLs;

		try {
			await page.goto(pageUrl);
		} catch (err) {
			console.error(err);
		}

		mails = await page.evaluate(() => {
			const regexForAllEmails = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

			const body = document.body.innerHTML;
			const stringContext = body.toString();
			return stringContext.match(regexForAllEmails);
		});

		mails.forEach(mail => writeStream.write(`${mail}\n`))
	}

	await browser.close();
})();