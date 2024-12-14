const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'title required']
  },
  author: {
    type: String,
    required: [true, 'author required']
  },
  url: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(www\.)[a-zA-Z0-9]+(\.[a-zA-Z]{2,})+$/.test(v)
      },
      message: props => `${props.value} should be in the format www.example.com`
    },
    required: [true, 'URL required']
  },
  likes: {
    type: Number
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)