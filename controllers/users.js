const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
  const body = request.body

  if(body.password === undefined) {

    return response.status(400).json({ error: 'password is missing' })
  }

  if(body.password.length < 3) {

    return response.status(400).json({ error: 'password must contain at least 3 characters' })

  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(body.password, saltRounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash,
  })

//toteutetaan virheiden käsittely
  try {
      const savedUser = await user.save()
      response.status(200).json(savedUser)

  } catch (error) {
      next(error)
  }
  
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1 })

    response.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter