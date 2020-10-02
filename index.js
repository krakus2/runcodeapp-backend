const express = require('express')
const winston = require('winston')

require('dotenv').config()

const app = express()

require('./utils/consoleLog')
require('express-async-errors')
require('./startup/logging')()
require('./startup/routes')(app)

const port = process.env.PORT || 5000

const server = app.listen(port, () => {
  winston.info(`Port is listening on ${port}`)
})

module.exports = server
