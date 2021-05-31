const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


//tulostaa konsoliin palvelimelle tulevien pyyntöjen perustietoja
const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method)
  logger.info('Path:  ', request.path)
  logger.info('Body:  ', request.body)
  logger.info('---')
  next()
}

//poimii tokenin frontista tulleesta headerista ja sijoittaa sen request-olioon
const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')

  const getToken = () => {

    if(authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)

    } else {

      return null
    }
  
  }
  
  const token = getToken()

  request.token = token

  next()

}

//selvittää pyyntöön liittyvän käyttäjän ja sijoittaa sen request-olioon
const userExtractor = async (request, response, next) => {
  
  //varmistetaan tokenin oikeellisuus ja dekoodataan samalla token olioksi, jonka perusteella se on laadittu
  const decodedToken = jwt.verify(request.token, process.env.SECRET)

    //jos tokenia ei ole, tai dekoodattu olio ei sisällä käyttäjän id:tä, palautetaan virheilmoitus
    if(!request.token || !decodedToken.id) {

      return response.status(401).json({ error: 'token missing or invalid' })

    }

  const user = await User.findById(decodedToken.id)

  request.user = user

  next()

}


//määritellään ja otetaan käyttöön middleware, joka suoritetaan, jos mikään route ei käsittele http-pyyntöä
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//virheenkäsittelijä
const errorHandler = (error, request, response, next) => {
  logger.error(error.message)

  if (error.name === 'ValidationError') {
      return response.status(400).json({ 
        error: error.message 
      })

  } else if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({ 
        error: 'invalid token' 
      })

  }

  logger.error(error.message)

  next(error)

}


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
    
}