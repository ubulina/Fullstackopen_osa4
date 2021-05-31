const lodash = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {

    const likes = blogs.map(blog => blog.likes)

    //console.log(likes)

    const reducer = (sum, item) => {
        return sum + item   
    }

    //console.log(likes.reduce(reducer, 0))

    return blogs.length === 0
        ? 0
        : likes.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {

    //järjestää blogit tykkäyksien perusteella laskevaan järjestykseen
    const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)

    //console.log(sortedBlogs)

    const blog = {

        title: sortedBlogs[0].title,
        author: sortedBlogs[0].author,
        likes: sortedBlogs[0].likes
    } 

    //console.log(blog)

    return blog
    
}

const mostBlogs = (blogs) => {
      
    const authorsCounted = lodash.countBy(blogs, 'author')

    //console.log(authorsCounted)

    const values = lodash.values(authorsCounted)

    //console.log(values)

    const maxValue = lodash.max(values)

    //console.log(maxValue)

    const indexOfMaxValue = lodash.indexOf(values, maxValue)

    //console.log(indexOfMaxValue)

    const keys = lodash.keys(authorsCounted)

    //console.log(keys)

    const author = keys[indexOfMaxValue]

    //console.log(author)

    
    const authorWithMostBlogs = {

        author: author,
        blogs: maxValue

    }

    //console.log(authorWithMostBlogs)

    return authorWithMostBlogs
}



module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    
}