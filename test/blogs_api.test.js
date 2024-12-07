const { test, after, describe, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
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

describe.only('POST to /api/blogs', async () => {
  
  test.only('works and the DB length increases correctly', async () => {
    const action = await api.post('/api/blogs')
      .send({
        title: 'Tukisivusto kroonisille ripuloijille',
        author: 'M.A. Halöysäl',
        url: 'http://ripuliranne.com',
        likes: 0
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)
      //console.log(action.body)

    const response = await api.get('/api/blogs')
    //console.log(response)
    assert.strictEqual(response.body.length, 5)
  })
  test.only('works and the new entry matches what was posted', async () => {
    const action = await api.post('/api/blogs')
      .send({
        title: 'Tukisivusto kroonisille ripuloijille',
        author: 'M.A. Halöysäl',
        url: 'http://ripuliranne.com',
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
    assert.strictEqual(newBlog.url, 'http://ripuliranne.com')
    assert.strictEqual(newBlog.likes, 0)
  })
})

after(async () => {
  await mongoose.connection.close()
})