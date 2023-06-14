const express = require('express')
const app = express()
const api = require('./api')
const { connectToDb } = require('./lib/mongo')

const bodyParser = require("body-parser");
app.use(bodyParser.json())
const port = process.env.port || 8000

app.use(express.json())
app.use(express.static('public'))

const rateLimit = require('./lib/ratelimit')


/*
 * All routes for the API are written in modules in the api/ directory.  The
 * top-level router lives in api/index.js.  That's what we include here, and
 * it provides all of the routes.
 */
app.use('/', rateLimit, api)

app.use('*', rateLimit, function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

connectToDb(function () {
  app.listen(port, function () {
    console.log("== Server is running on port", port)
  })
})