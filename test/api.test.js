const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')
const bcrypt = require('bcrypt')

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('correct amount of blogs is returned', async () => {
  const response = await api.get('/api/blogs')
  //console.log(response)

  assert.strictEqual(response.body.length, 4)
})

test('the returned objects have "id" instead of "_id"', async () => {
  const response = await api.get('/api/blogs')
  //console.log('id-testi', response.body)

  response.body.forEach(blog => {
    assert.strictEqual(blog.hasOwnProperty('id'), true)
    assert.strictEqual(blog.hasOwnProperty('_id'), false)
  })
})

describe('POST to /api/blogs', async () => {
  
  test('works and the DB length increases correctly', async () => {
    const action = await api.post('/api/blogs')
      .send({
        title: 'Tukisivusto kroonisille ripuloijille',
        author: 'M.A. Halöysäl',
        url: 'www.ripuliranne.com',
        likes: 0
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      //console.log(action.body)

    const response = await api.get('/api/blogs')
    //console.log(response)
    assert.strictEqual(response.body.length, 5)
  })
  test('works and the new entry matches what was posted', async () => {
    const action = await api.post('/api/blogs')
      .send({
        title: 'Tukisivusto kroonisille ripuloijille',
        author: 'M.A. Halöysäl',
        url: 'www.ripuliranne.com',
        likes: 0
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      //console.log(action.body)

    const response = await api.get('/api/blogs')
    //console.log(response)
    const blogs = response.body
    const newBlog = blogs[blogs.length - 1]
    assert.strictEqual(newBlog.title, 'Tukisivusto kroonisille ripuloijille')
    assert.strictEqual(newBlog.author, 'M.A. Halöysäl')
    assert.strictEqual(newBlog.url, 'www.ripuliranne.com')
    assert.strictEqual(newBlog.likes, 0)
  })
  test('dont work when the title is missing', async () => {
    const action = await api.post('/api/blogs')
      .send({
        author: 'M.A. Halöysäl',
        url: 'www.ripuliranne.com',
        likes: 0
      })
      .expect(400)
    })
  test('dont work when the url is missing', async () => {
    const action = await api.post('/api/blogs')
      .send({
        title: 'Tukisivusto kroonisille ripuloijille',
        author: 'M.A. Halöysäl',
        likes: 0
      })
      .expect(400)
    })
})

describe('DELETE a blog', async () => {
  test('by id works and the DB length decreases correctly', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const blogToDelete = initialBlogs.body[0]
    //console.log(initialBlogs, blogToDelete)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const response = await api.get('/api/blogs')
    //console.log(response.body.length)
    assert.strictEqual(response.body.length, 3)
  })
})

describe('PUT method', async () => {
  test('works and an entry is properly updated according to given parameters', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const blogToUpdateId = initialBlogs.body[0].id
    
    //console.log(blogToUpdateId)
    const action = await api.put(`/api/blogs/${blogToUpdateId}`)
      .send({
        title: 'Se Wsi Barembi Blogitexti',
        author: 'M.A. Halöysäl',
        url: 'www.ripuliranne.com',
        likes: 0
      })
      .expect(200)

    const updatedBlogs = await api.get('/api/blogs')
    //console.log(updatedBlogs)
    assert.strictEqual(updatedBlogs.body[0].title, 'Se Wsi Barembi Blogitexti')
  })
  test('can be used to increase likes', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const blogToUpdateId = initialBlogs.body[0].id
    const blogOldLikes = initialBlogs.body[0].likes
    
    //console.log(blogToUpdateId)
    const action = await api.put(`/api/blogs/${blogToUpdateId}`)
      .send({
      likes: blogOldLikes + 1
      })
      .expect(200)

    const updatedBlogs = await api.get('/api/blogs')
    //console.log(updatedBlogs)
    assert.strictEqual(updatedBlogs.body[0].likes, 4)    
  })
})

// User tests begin

describe.only('Adding a user', async () => {
  test.only('initial users exist and the first one is pewdiepie', async () => {
    const initUsers = await api.get('/api/users')
      .expect(200)
      //console.log(initUsers)
    
    assert.strictEqual(initUsers.body.length, 2)
    assert.strictEqual(initUsers.body[0].username, "pewdiepie")
  })
  test.only('works properly when parameters are valid', async () => {
    const action = await api.post('/api/users')
    .send({
      username: 'mororallaa',
      name: "Matti Morottaja",
      password: "pspspspsps"
    })

    const users = await api.get('/api/users')
      .expect(200)

    assert.strictEqual(users.body.length, 3)
    assert.strictEqual(users.body[2].username, "mororallaa")

  })
  test.only('does not work when username is too short', async () => {
    const action = await api.post('/api/users')
      .send({
        username: 'MA',
        name: "Matti Alanne",
        password: 'salasana'
      })
      .expect(400)

    const users = await api.get('/api/users')
    assert.strictEqual(users.body.length, 2)
  })
  test.only('does not work when password is too short', async () => {
    const action = await api.post('/api/users')
      .send({
        username: 'manummine',
        name: "Matti Alanne",
        password: 'sa'
      })
      .expect(400)

    const users = await api.get('/api/users')
    assert.strictEqual(users.body.length, 2)
    
  })
})

after(async () => {
  await mongoose.connection.close()
})