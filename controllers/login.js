const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findOne({ username: body.username })
  //tarkastetaan salasanan oikeellisuus
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  //luodaan token
  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)
  
  //vastataan onnistuneeseen pyyntöön ja lähetetään token vastauksen bodyssä pyynnön tekijälle
  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter