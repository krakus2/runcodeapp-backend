require('dotenv').config();

module.exports = {
   mongoUrl: process.env.MONGOURL_PROD,
   sqlPassword: process.env.SQL_PASSWORD
};
