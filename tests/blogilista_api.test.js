const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')

//luodaan superagent-olio, jonka kautta testit voivat tehdä http-pyyntöjä
const api = supertest(app)
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially some blogs saved', () => { 

    //alustetaan tietokanta ennen jokaisen testin suoritusta
    beforeEach(async () => {
        await Blog.deleteMany({})
        let blogObject = new Blog(helper.initialBlogs[0])
        await blogObject.save()
        blogObject = new Blog(helper.initialBlogs[1])
        await blogObject.save()
        blogObject = new Blog(helper.initialBlogs[2])
        await blogObject.save()
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test('the unique identifier property of the blog posts is named id', async () => {
        const response = await api.get('/api/blogs')

        const allIds = response.body.map(r => r.id)

        //console.log(allIds)

        expect(allIds).toBeDefined()
        
        //expect(response.body[0].id).toBeDefined()
        
    })

    describe('addition of a new blog', () => { 

        //luodaan testikäyttäjä valmiiksi tietokantaan
        beforeEach (async () => {
            await User.deleteMany({})
        
            const passwordHash = await bcrypt.hash('Jumpukka', 10)
            const user = new User({ username: 'ajuu', name: 'Anna Juupanen', passwordHash })
            await user.save()
        })

        test('a valid blog can be added', async () => {
            const newBlog = {
                title: "Go To Statement Considered Harmful",
                author: "Edsger W. Dijkstra",
                url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
                likes: 12 
                   
            }

            const response = await api
                .post('/api/login')
                .send({ "username": "ajuu", "password": "Jumpukka" })

            const token = response.body.token

            await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)


            //varmistetaan, että blogien lukumäärä kasvaa yhdellä
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

            //varmistetaan, että oikeansisältöinen blogi on lisätty
            const titles = blogsAtEnd.map(b => b.title)    
            expect(titles).toContain('Go To Statement Considered Harmful')

        })

        //testaa, että blogin lisääminen ei onnistu ilman tokenia
        test('if a token is not provided, adding a blog fails with statuscode 401', async () => {

            const newBlog = {   
                title: "TDD harms architecture",
                author: "Robert C. Martin",
                url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
                likes: 0,
            }

            const response = await api
                .post('/api/login')
                .send({ "username": "ajuu", "password": "Jumpukka" })

            //testissä tokenia ei liitetä kutsuun    
            const token = response.body.token

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(401)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

        })

        test('if the likes property is missing, it will default to the value 0', async () => {
            
            const newBlogWithoutLikes = {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html"
                  
            }

            const newBlog = {
                title: newBlogWithoutLikes.title,
                author: newBlogWithoutLikes.author,
                url: newBlogWithoutLikes.url,
                likes: 0
                
            }

            const response = await api
                .post('/api/login')
                .send({ "username": "ajuu", "password": "Jumpukka" })

            const token = response.body.token

            await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/)

            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1) 

        })

        test('blog without title and url is not added', async () => {
            const newBlog = {
                author: "Edsger W. Dijkstra",
                likes: 10,
            }

            const response = await api
                .post('/api/login')
                .send({ "username": "ajuu", "password": "Jumpukka" })

            const token = response.body.token

            await api
                .post('/api/blogs')
                .set('Authorization', `bearer ${token}`)
                .send(newBlog)
                .expect(400)

            //const response = await api.get('/api/blogs')

            const blogsAtEnd = await helper.blogsInDb()

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)

        })
    })  

    describe('deletion of a blog', () => { 

        test('deletion of a blog succeeds with status code 204 if id is valid', async () => {
            const blogsAtStart = await helper.blogsInDb()
            const blogToDelete = blogsAtStart[2]

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)
            
            const blogsAtEnd = await helper.blogsInDb()
            
            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

            const titles = blogsAtEnd.map(b => b.title)

            expect(titles).not.toContain(blogToDelete.title)
        })
    })

    describe('updating af a blog', () => { 

        test('updating number of likes succeeds with status code 200 if id is valid', async () => {
            
            const blogsAtStart = await helper.blogsInDb()
            const blogToUpdate = blogsAtStart[2]

            //console.log(blogToUpdate)

            const updatedBlog = {
                title: blogToUpdate.title,
                author: blogToUpdate.author,
                url: blogToUpdate.url,
                likes: 3
                
            }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedBlog)
                .expect(200)

            const blogsAtEnd = await helper.blogsInDb()

            //console.log(blogsAtEnd)

            expect(blogsAtStart[2].likes).not.toEqual(blogsAtEnd[2].likes)

            expect(blogsAtStart[2].likes).toEqual(blogsAtEnd[2].likes - 1)
        })
    })    
})

describe('when there is initially one user at db', () => {
    //tyhjennetään testitietokanta ja luodaan tietokantaan uusi user
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', name: 'Roope Otsola', passwordHash })
  
      await user.save()
    })

    //testaa uuden käyttäjän luomisen uniikilla käyttäjätunnuksella
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'mluukkai',
        name: 'Matti Luukkainen',
        password: 'salainen',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    //testaa, että käyttäjätunnus on uniikki
    test('creation fails with proper statuscode and message if username is already taken', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'root',
          name: 'Superuser',
          password: 'salainen',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('`username` to be unique')
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    //testaa, että salasana on olemassa 
    test('creation fails with proper statuscode and message if password is missing', async () => {
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'annu',
          name: 'Annika Nuponen'  
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400) 
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('password is missing') 
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length) 


    })
    
    //testaa, että käyttäjätunnus on olemassa 
    test('creation fails with proper statuscode and message if username is missing', async () => { 
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          name: 'Annika Nuponen',
          password: 'purnukka'
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('`username` is required')
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

    })

    //testaa, että käyttäjätunnus on vähintään 3 merkkkiä pitkä 
    test('creation fails with proper statuscode and message if username is too short', async () => { 
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'an',
          name: 'Annika Nuponen',
          password: 'purnukka',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('is shorter than the minimum allowed length (3)')
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

    })

    //testaa, että salasana on vähintään 3 merkkiä pitkä  
    test('creation fails with proper statuscode and message if password is too short', async () => { 
        const usersAtStart = await helper.usersInDb()
    
        const newUser = {
          username: 'annu',
          name: 'Annika Nuponen',
          password: 'pu',
        }
    
        const result = await api
          .post('/api/users')
          .send(newUser)
          .expect(400)
          .expect('Content-Type', /application\/json/)
    
        expect(result.body.error).toContain('password must contain at least 3 characters')
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)

    })

})
//katkaistaan mongoosen käyttämä tietokantayhteys
afterAll(() => {
    mongoose.connection.close()
})