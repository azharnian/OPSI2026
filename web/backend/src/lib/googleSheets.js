const { google } = require("googleapis");
const path = require("path");

const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

let sheetsClient = null;

async function getSheets() {
  if (sheetsClient) return sheetsClient;

  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: SCOPES,
  });

  sheetsClient = google.sheets({ version: "v4", auth });
  return sheetsClient;
}

module.exports = { getSheets };
