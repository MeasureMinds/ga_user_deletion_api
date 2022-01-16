const puppeteer = require("puppeteer");

function blockingWait(seconds) {
  var waitTill = new Date(new Date().getTime() + seconds * 1000);
  while (waitTill > new Date()) {}
}

const convertDate = (objDate) => {
  return (
    objDate.toLocaleString("en", { day: "numeric" }) +
    " " +
    objDate.toLocaleString("en", { month: "short" }) +
    " " +
    objDate.toLocaleString("en", { year: "numeric" })
  );
};

const addDays = (date, days) => {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const download_dates = async (frame, date1, date2) => {
  await frame.waitForSelector(".ID-view._GAVr");
  const dateButton = await frame.$(".ID-view._GAVr");
  await dateButton.click();
  console.log("clicked dateButton");

  const startDateEl = await frame.$(".ID-datecontrol-primary-start");
  const endDateEl = await frame.$(".ID-datecontrol-primary-end");

  await endDateEl.click({ clickCount: 3 });
  await endDateEl.type(date2);
  console.log("finished endDateEl");

  await startDateEl.click({ clickCount: 3 });
  await startDateEl.type(date1);
  console.log("finished startDateEl");

  const applyButton = await frame.$(".ID-apply");
  await applyButton.click();
  console.log("clicked applyButton");

  blockingWait(1);
  await frame.waitForFunction(
    "document.querySelector('.ID-loadingProgressBarContainer').clientHeight == 0",
    { timeout: 200000 }
  );
  console.log("Loading finished");

  const exportButton = await frame.$(".ID-exportControlButton");
  await exportButton.click();
  console.log("clicked exportButton");

  const excelButton = await frame.$(".ACTION-export.TARGET-XLSX");
  await excelButton.click();
  console.log("clicked excelButton");
};

const download = async (url, daysStep, startDate, yesterday) => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 80,
    ignoreHTTPSErrors: true,
    args: [`--window-size=1920,1080`],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();

  await page.goto("https://accounts.google.com/");
  await page.waitForTimeout(500); 

  blockingWait(60);
  const page1 = await browser.newPage();
  await page1.goto(url);
  blockingWait(5);

  await page1.waitForSelector("iframe");

  const elementHandle = await page1.$("#galaxyIframe");
  const frame = await elementHandle.contentFrame();

  let currentDate = startDate;
  let lastCurrentDate = startDate;
  let steps = 0;
  while (currentDate < yesterday) {
    steps++;
    lastCurrentDate = currentDate;
    if (addDays(currentDate, daysStep) <= yesterday) {
      currentDate = addDays(currentDate, daysStep);
      console.log(convertDate(lastCurrentDate), convertDate(currentDate));
      await download_dates(
        frame,
        convertDate(lastCurrentDate),
        convertDate(currentDate)
      );
      currentDate = addDays(currentDate, 1);
    } else {
      currentDate = yesterday;
      console.log(convertDate(lastCurrentDate), convertDate(currentDate));
      await download_dates(
        frame,
        convertDate(lastCurrentDate),
        convertDate(currentDate)
      );
    }
    blockingWait(15);
  }
};

// URL to User Explorer report
const url =
  "https://analytics.google.com/analytics/web/#/report/visitors-legacy-user-id/...../_u.date00=20160309&_u.date01=20160320&_.useg=..........&explorer-table.plotKeys=%5B%5D&explorer-table.rowStart=0&explorer-table.rowCount=250/";

// How many days to export per one download
const daysStep = 2;

// Change start date
const startDate = new Date("02/23/2021");
const yesterday = addDays(new Date(), -1);

// Run script
download(url, daysStep, startDate, yesterday);
