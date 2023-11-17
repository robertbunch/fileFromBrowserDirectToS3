const express = require('express')
const app = express()
const indexRouter = require('./indexRouter')
//allow us to serve up front end files
app.use(express.json()) // we need req.body
app.use(express.static('public'))
app.use(indexRouter)

app.listen(3000) //any port is fine
console.log("Listening on port 3000")