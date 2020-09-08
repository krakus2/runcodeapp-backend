const express = require('express')
require('dotenv').config()
//const debug = require('debug')('app:startup');
const app = express()
const winston = require('winston')
const path = require('path')

require('./utils/consoleLog')
require('express-async-errors')
require('./startup/logging')()
require('./startup/routes')(app)

if (process.env.NODE_ENV === 'production') {
  //set static folder
  const buildPath = path.join(__dirname, '../', 'frontend', 'build')
  app.use(express.static(buildPath))
  //for any route that isn't hit with routes/api use this route
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'))
  })
}

const port = process.env.PORT || 5000

const server = app.listen(port, () => {
  winston.info(`Port is listening on ${port}`)
})

module.exports = server
