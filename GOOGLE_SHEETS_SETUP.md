# Google Sheets Localization Setup Guide

## Step-by-Step: Create Google Sheet Structure

### Step 1: Create a New Google Sheet

1. Go to [Google Sheets](https://sheets.google.com/)
2. Click **"Blank"** to create a new spreadsheet
3. Name it (e.g., "App Translations")

### Step 2: Set Up Columns

In the **first row**, add these exact column headers:

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| **Key** | **English** | **Hindi** | **Arabic** |

**Important:** Column names must match exactly (case-sensitive):
- `Key` (first column)
- `English` (second column)
- `Hindi` (third column)
- `Arabic` (fourth column)

### Step 3: Add Translation Data

Start from **row 2** and add your translations:

| Key | English | Hindi | Arabic |
|-----|---------|-------|--------|
| title | Localization Demo | स्थानीयकरण डेमो | عرض الترجمة |
| description | Change language below | भाषा बदलें | تغيير اللغة |
| chooseLanguage | Choose Language | भाषा चुनें | اختر اللغة |
| english | English | अंग्रेज़ी | الإنجليزية |
| hindi | Hindi | हिन्दी | الهندية |
| arabic | Arabic | अरबी | العربية |
| systemDefault | Use System Default | सिस्टम की भाषा उपयोग करें | استخدام لغة النظام |
| sampleTitle | Sample Text | नमूना पाठ | نص تجريبي |
| sampleParagraph | This is a sample paragraph demonstrating localization in the app. | यह ऐप में स्थानीयकरण प्रदर्शित करने के लिए एक नमूना अनुच्छेद है। | هذه فقرة تجريبية لعرض الترجمة داخل التطبيق. |

### Step 4: Publish as CSV

1. Click **File** → **Share** → **Publish to web**
2. In the dialog:
   - **Link type**: Select **"Entire document"**
   - **Format**: Select **"CSV"**
3. Click **"Publish"**
4. Copy the generated URL (it will look like):
   ```
   https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv
   ```

### Step 5: Update Code with Your CSV URL

**File: `src/services/googleSheetsI18n.js`**
- Replace `YOUR_SHEET_ID` with your actual Google Sheet ID from the URL
- Example: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQWJ5rq5u33LWjlI2aFMZSPAfQdsqaYma66JOtGWgdTKNUrQwdju1_ZfwMnCg6n23nyMtgEuSP4CS5c/pub?output=csv`

**File: `src/services/LoadSheetTranslation.js`**
- Replace `YOUR_SHEET_ID` with the same Sheet ID

### Step 6: Make Sheet Public (Important!)

1. Click **Share** button (top right)
2. Change access to **"Anyone with the link"**
3. Click **"Done"**

## How It Works

✅ **Fresh Data Always**: The app fetches directly from Google Sheets (not cached)
✅ **AsyncStorage**: Only stores your language preference, not translations
✅ **Auto-Update**: Every time you open the screen, it fetches latest Google Sheets data
✅ **Offline Fallback**: If fetch fails, uses cached translations as backup

## Column Structure Example

```
Row 1: Key | English | Hindi | Arabic
Row 2: title | Localization Demo | स्थानीयकरण डेमो | عرض الترجمة
Row 3: description | Change language... | भाषा बदलें... | تغيير اللغة...
```

## Important Notes

- ✅ Column names must match exactly: `Key`, `English`, `Hindi`, `Arabic`
- ✅ First row must be headers
- ✅ Sheet must be published as CSV
- ✅ Sheet must be accessible (Anyone with link can view)
- ✅ CSV URL must end with `?output=csv`

## Troubleshooting

**Not loading translations?**
- Check CSV URL is correct
- Verify sheet is published as CSV
- Ensure sheet is publicly accessible
- Check column names match exactly

**Wrong translations showing?**
- App fetches fresh data on every screen open
- Clear app data if you see old cached translations
- Check Google Sheet has correct data

**RTL not working for Arabic?**
- App will auto-reload when Arabic is selected
- If layout doesn't change, restart app manually

