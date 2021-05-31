const blogRouter = require('express').Router()
const middleware = require('../utils/middleware')
const Blog = require('../models/blog')
//const User = require('../models/user')
//const jwt = require('jsonwebtoken')


//kaikki määriteltävät routet liitetään router-olioon

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })

    response.json(blogs.map(blog => blog.toJSON()))
      
})

  
blogRouter.post('/', middleware.userExtractor, async (request, response) => {
    //const blog = new Blog(request.body)

    const body = request.body
      
    const user = request.user

    //kun identiteetti on selvä, blogi lisätään tokenin haltijan nimiin
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id 
      
    })

    if (blog.title === undefined) {
        
      return response.status(400).json()

    } else if (blog.url === undefined) {
        
        return response.status(400).json()

    } else {

        const savedBlog = await blog.save()

        //talletetaan tieto blogista myös useriin
        user.blogs = user.blogs.concat(savedBlog._id)
        await user.save()
        
        response.status(201).json(savedBlog.toJSON())
            
    }

})

/*

blogRouter.delete('/:id', async (request, response) => {
    
    await Blog.findByIdAndRemove(request.params.id)

    return response.status(204).end()
})

*/


blogRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
    
    const user = request.user

    const blog = await Blog.findById(request.params.id)

    //jos poiston tekijä on sama kuin blogin lisääjä, poistaminen onnistuu
    if(blog.user.toString() === user._id.toString()) {

      await Blog.findByIdAndRemove(request.params.id)

      return response.status(204).end()

    } else {

      return response.status(401).json({ error: 'no right to delete the blog'})

    }
    
})


blogRouter.put('/:id', async (request, response) => {

    const body = request.body

    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {new: true})

    //console.log(updatedBlog.toJSON)

    response.status(200).json(updatedBlog.toJSON)
})

module.exports = blogRouter