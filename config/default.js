require('dotenv').config()

module.exports = {
  mongoUrl: process.env.MONGOURL_PROD,
  sqlHost: process.env.SQL_HOST,
  sqlUser: process.env.SQL_USER,
  sqlDatabase: process.env.SQL_DATABASE,
  sqlPassword: process.env.SQL_PASSWORD,
}
