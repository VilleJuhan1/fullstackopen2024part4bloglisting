const Blog = require('../models/blog')

const initialBlogs = [
  {
    "title": "Jännittävä kasvisruokablogi",
    "author": "Venla Vegaani",
    "url": "www.lihaton.com",
    "likes": 3,
  },
  {
    "title": "Jännittävä liharuokablogi",
    "author": "Laila Lihansyöjä",
    "url": "www.lihaaon.com",
    "likes": 5,
  },
  {
    "title": "Jumppaa viidessä minuutissa",
    "author": "Laila Lihansyöjä",
    "url": "www.jumppaaon.com",
    "likes": 2,
  },
  {
    "title": "Keskinkertainen kalaruokablogi",
    "author": "Kalle Kalastaja",
    "url": "www.lihaaonkalakin.com",
    "likes": 4,
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ title: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}