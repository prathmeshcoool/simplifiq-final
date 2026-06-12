const { google } = require("googleapis");

const getAuth = () => {
  // On Render (or any cloud): use GOOGLE_CREDENTIALS_JSON env var
  if (process.env.GOOGLE_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
  }

  // Local dev: use the JSON key file placed inside /server
  return new google.auth.GoogleAuth({
    keyFile: "google-credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

const addLeadToSheet = async (leadData) => {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  if (!spreadsheetId) {
    console.warn("GOOGLE_SHEET_ID not set in .env — skipping Sheets log.");
    return;
  }

  try {
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:E",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            leadData.name,
            leadData.email,
            leadData.company,
            new Date().toLocaleString(),
            leadData.status,
          ],
        ],
      },
    });

    console.log("Lead added to Google Sheets");
  } catch (error) {
    // Log but don't throw — a Sheets failure shouldn't break the main workflow
    console.error("Google Sheets Error:", error.message);
  }
};

module.exports = addLeadToSheet;
