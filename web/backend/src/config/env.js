require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 8080),
  googleSpreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || "",
};

module.exports = { env };
