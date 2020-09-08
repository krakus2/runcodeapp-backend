const express = require('express')
const tests = require('../routes/api/tests')
const errorMiddleware = require('../middleware/error.js')

//Middlewares and routes

module.exports = function (app) {
  app.use(express.json())
  app.use('/api/tests', tests.router)
  app.use(errorMiddleware)
}
