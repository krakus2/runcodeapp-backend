const express = require('express')
const cors = require('cors')

const tests = require('../routes/api/tests')
const errorMiddleware = require('../middleware/error.js')

//Middlewares and routes

module.exports = function (app) {
  app.use(cors())
  app.use(express.json())
  app.use('/api/tests', tests.router)
  app.use(errorMiddleware)
}
