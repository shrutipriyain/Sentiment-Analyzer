let p = require("puppeteer");
var Sentiment = require('sentiment');
var sentiment = new Sentiment();
const colors = require('colors');

let url = process.argv[2];

( async function () {
  let browser = await p.launch({
    headless: false,
    defaultViewport: null,
    args: ["--start-maximized"], 
});

  let pages = await browser.pages();
  let page = pages[0];

  await page.goto(url, {
    waitUntil: "load",
  });

  await page.waitForSelector('h1.title', { visible: true });

  await page.waitForSelector("#comments", { visible: true });

  let commentSection = await page.$("#comments");

  await page.evaluate(section => {
    section.scrollIntoView();
  }, commentSection);
  
  await page.waitForTimeout(5000);

  let allComments = await page.$$("#comment #content-text");

  let allCommentsText = [];

  for (let i = 0; i < allComments.length; i++) {
    let comment = await page.evaluate(function (el) {
      return el.textContent;
    }, allComments[i]);

    allCommentsText.push(comment);
  }

  let description = await page.$$("#description-and-actions #text");
  // console.log(description.length);
  
  let stats = await page.evaluate((a, b) => {
    let like = a.textContent;
    let dislike = b.textContent;
    return {like, dislike};
  }, description[0], description[1]);

  // console.log(stats);

  let score = 0;

  for(i in allCommentsText) {
      console.log(sentiment.analyze(allCommentsText[i]));
      var result = sentiment.analyze(allCommentsText[i]).score;
      score += result;
  }

  console.log(`Sentiment Score: `.bold.magenta + `${score/allCommentsText.length}`.bold.cyan);
  console.log(`👍: ${stats.like}`.green);
  console.log(`👎: ${stats.dislike}`.red);
  // console.log(likes);
  // console.log(dislikes);
  // console.log(description);

  await browser.close();

})();