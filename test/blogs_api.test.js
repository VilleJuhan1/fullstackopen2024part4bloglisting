const { test, after, beforeEach } = require('node:test')
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

test.only('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test.only('correct amount of blogs is returned', async () => {
  const response = await api.get('/api/blogs')
  //console.log(response)

  assert.strictEqual(response.body.length, 4)
})

test.only('the returned objects have "id" instead of "_id"', async () => {
  const response = await api.get('/api/blogs')
  //console.log('id-testi', response.body)

  response.body.forEach(blog => {
    assert.strictEqual(blog.hasOwnProperty('id'), true)
    assert.strictEqual(blog.hasOwnProperty('_id'), false)
  })
})

after(async () => {
  await mongoose.connection.close()
})