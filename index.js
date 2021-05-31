const app = require('./app')//importataan varsinainen Express-sovellus
const http = require('http')

const config = require('./utils/config')//päästään käsiksi ympäristömuuttujiin
const logger = require('./utils/logger')//päästään käsiksi loggerin funktioihin

const server = http.createServer(app) //käynnistetään sovellus

//portti on määritelty ympäristömuuttujat-tiedostossa
server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})

