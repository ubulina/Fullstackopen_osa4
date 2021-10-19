const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    likes: Number,
    comments: [String],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
})


//muokataan kannasta haettavien olioiden muotoa
blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })


module.exports = mongoose.model('Blog', blogSchema)

