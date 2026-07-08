import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("pageerror", (err) => {
    console.log("PAGE ERROR:", err.message);
  });
  
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("CONSOLE ERROR:", msg.text());
    }
  });

  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
  await browser.close();
}

run();
