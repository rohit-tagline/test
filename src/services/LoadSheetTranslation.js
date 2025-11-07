const fs = require("fs");
const path = require("path");
const Papa = require("papaparse");

// Replace with your Google Sheets CSV URL
const CSV_URL ="https://docs.google.com/spreadsheets/d/e/2PACX-1vSKo5KNxTmtfb54xBf_q-Uj87Dv_hnhs5gpuoj1xponUdLg3LfzeIkjJqbNzbppF2EfMFSVY8Xv3wfK/pub?output=csv"
  // "https://docs.google.com/spreadsheets/d/e/2PACX-1vQWJ5rq5u33LWjlI2aFMZSPAfQdsqaYma66JOtGWgdTKNUrQwdju1_ZfwMnCg6n23nyMtgEuSP4CS5c/pub?output=csv";

async function fetchAndSaveTranslations() {
  try {
    console.log("📥 Fetching translations from Google Sheets...");
    const response = await fetch(CSV_URL);
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const records = parsed.data;

    const en = {};
    const hi = {};
    const ar = {};

    records.forEach((row) => {
      const key = row["Key"] || row["key"];
      if (!key) return;

      en[key] = row["English"] || row["english"] || key;
      hi[key] = row["Hindi"] || row["hindi"] || key;
      ar[key] = row["Arabic"] || row["arabic"] || key;
    });

    const localesDir = path.join(__dirname, "..", "googlesheetlocales");

    // Ensure locales directory exists
    if (!fs.existsSync(localesDir)) {
      fs.mkdirSync(localesDir, { recursive: true });
      console.log("✅ Created directory: googlesheetlocales");
    }

    fs.writeFileSync(
      path.join(localesDir, "en.json"),
      JSON.stringify(en, null, 2)
    );
    fs.writeFileSync(
      path.join(localesDir, "hi.json"),
      JSON.stringify(hi, null, 2)
    );
    fs.writeFileSync(
      path.join(localesDir, "ar.json"),
      JSON.stringify(ar, null, 2)
    );

    console.log("✅ JSON files generated successfully!");
    console.log(`✅ Location: ${localesDir}`);
    console.log("✅ Files: en.json, hi.json, ar.json");
    console.log(`✅ Total keys: ${Object.keys(en).length}`);
  } catch (err) {
    console.error("❌ Failed to fetch translations:", err);
    process.exit(1);
  }
}

fetchAndSaveTranslations();

