const listHelper = require('../utils/list_helper')

describe('favorite blog', () => {

    const biggerList = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
          },
          {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
          },
          {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
          },
          {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
          },
          {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0
          },
          {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0
          }  

    ]

    test('when there is one blog which has more likes than the others', () => {
        const result = listHelper.favoriteBlog(biggerList)    

        const favorite = {

            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            likes: 12
        }

        //console.log(favorite)

        expect(result).toEqual(favorite)    

    })

    const listWithOneBlog = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0

        }
    ]

    test('when list has only one blog, that is the favourite blog', () => {
        const result = listHelper.favoriteBlog(listWithOneBlog)

        const favorite = {

            title: "React patterns",
            author: "Michael Chan",
            likes: 7,
        }

        expect(result).toEqual(favorite)
    })

    const listWithTwoEqualLikes = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
          },
          {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 12,
            __v: 0
          },
          {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 10,
            __v: 0
          },
          {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 12,
            __v: 0
          },

    ]
        //jos blogeilla on sama määrä liketyksiä, niiden aiempi keskinäinen järjestys ei muutu jonoon järjestämisen jälkeen
    test('when there are two blogs with equal likes, the first blog of them in the order is the favourite blog', () => {
        const result = listHelper.favoriteBlog(listWithTwoEqualLikes)

        const favorite = {
                title: "Go To Statement Considered Harmful",
                author: "Edsger W. Dijkstra",
                likes: 12,
        }

            
        expect(result).toEqual(favorite)
      
    })

        
})
