require("dotenv").config();

const env = {
  port: Number(process.env.PORT || 8080),
};

module.exports = { env };
