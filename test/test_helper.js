const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    "title": "Jännittävä kasvisruokablogi",
    "author": "Venla Vegaani",
    "url": "www.lihaton.com",
    "likes": 3,
  },
  {
    "title": "Keskinkertainen kalaruokablogi",
    "author": "Kalle Kalastaja",
    "url": "www.lihaaonkalakin.com",
    "likes": 4,
  }
]

const initialUsers = [
  {
    "username": "pewdiepie",
    "name": "Hans Hansson",
    "password": "password"
  },
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

const nonExistingUserId = async () => {
  const user = new User({ username: 'willremovethissoon', password: 'password' })
  await user.save()
  await user.deleteOne()

  return user._id.toString()
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, nonExistingId, blogsInDb, nonExistingUserId, usersInDb
}