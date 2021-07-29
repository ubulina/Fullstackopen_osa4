const config = require('./utils/config')//haetaan ympäristömuuttujat käyttöön
const express = require('express')//otetaan Express käyttöön
require('express-async-errors')
const app = express() //luodaan express-sovellusta vastaava olio 
const cors = require('cors') //sallitaan muista origineista tulevat pyynnöt
const blogRouter = require('./controllers/blogs')//otetaan blogRouter käyttöön
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

//sallitaan muista origineista tulevat pyynnöt (frontendia varten)
app.use(cors())


//otetaan json-parseri käyttöön
app.use(express.json())

app.use(middleware.requestLogger)

app.use(middleware.tokenExtractor)

//app.use(middleware.userExtractor)


//routeria käytetään, jos polun alkuosa on seuraava
//itse routerissa riittää määritellä vain polun loppuosa
app.use('/api/blogs', blogRouter)

app.use('/api/users', usersRouter)

app.use('/api/login', loginRouter)

//testirouter lisätään mukaan vain, jos sovellusta suoritetaan test-moodissa
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

//sijoitetaan vasta router-määrittelyn jälkeen ja 
//toiseksiviimeiseksi ennen virheidenkäsittelijää
app.use(middleware.unknownEndpoint)

//virheidenkäsittelijä otetaan viimeiseksi käyttöön
app.use(middleware.errorHandler)

module.exports = app