const config = require('./config')
const express = require('express')
const path = require('path')
const app = express()
require('./modules/listener')

app.use(express.static(path.join(__dirname, '../client/build')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
})

app.listen(config.port, () => {
  console.log(`Support Children service started...\nListening on port ${config.port}`)
})

    