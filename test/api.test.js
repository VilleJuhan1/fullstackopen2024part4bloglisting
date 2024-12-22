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
  await User.deleteMany({})

  // Create users using app methods
  for (const user of helper.initialUsers) {
    await api.post('/api/users').send(user)
  }

  // Get the first user to use for blog creation
  const users = await api.get('/api/users')
  const user = users.body[0]

  // Authenticate the first user to get the token
  const loginResponse = await api.post('/api/login').send({
    username: user.username,
    password: 'password'
  })
  const token = loginResponse.body.token

  // Create blogs using the token
  for (const blog of helper.initialBlogs) {
    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blog)
  }
})

test('blogs are returned as json', async () => {
  const response = await api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  //console.log(response.body)
})

test('users are returned as json', async () => {
  const response = await api.get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  //console.log(response.body)
})

test('correct amount of blogs is returned', async () => {
  const response = await api.get('/api/blogs')
  //console.log(response)

  assert.strictEqual(response.body.length, 2)
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
  
  test('works using existing user and the DB length increases correctly', async () => {
    const loginResponse = await api.post('/api/login')
      //console.log('loginResponse', loginResponse.body)
      .send({
        username: 'pewdiepie',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token
    //console.log(token)

    const action = await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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
    //console.log('blogs', response)
    assert.strictEqual(response.body.length, 3)
  })
  test('works and the new entry matches what was posted', async () => {
    const loginResponse = await api.post('/api/login')
      //console.log('loginResponse', loginResponse.body)
      .send({
        username: 'pewdiepie',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token
    //console.log(token)

    const action = await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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

  test('doesnt work when the title is missing', async () => {
    const loginResponse = await api.post('/api/login')
      //console.log('loginResponse', loginResponse.body)
      .send({
        username: 'pewdiepie',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token
    //console.log(token)

    const action = await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        author: 'M.A. Halöysäl',
        url: 'www.ripuliranne.com',
        likes: 0
      })
      .expect(400)
    })

  test('doesnt work when the url is missing', async () => {
    const loginResponse = await api.post('/api/login')
      //console.log('loginResponse', loginResponse.body)
      .send({
        username: 'pewdiepie',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token
    //console.log(token)

    const action = await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Tukisivusto kroonisille ripuloijille',
        author: 'M.A. Halöysäl',
        likes: 0
      })
      .expect(400)
    })

    test('doesnt work when wrong token', async () => {
      const action = await api.post('/api/blogs')
        .set('Authorization', `Bearer khskjghjsakhgkjweahkjg`)
        .send({
          title: 'Tukisivusto kroonisille ripuloijille',
          author: 'M.A. Halöysäl',
          likes: 0
        })
        .expect(401)
      })
      test('doesnt work when no token', async () => {
        const action = await api.post('/api/blogs')
          .send({
            title: 'Tukisivusto kroonisille ripuloijille',
            author: 'M.A. Halöysäl',
            likes: 0
          })
          .expect(401)
        })
  
})

describe('DELETE a blog', async () => {
  test('by id works and the DB length decreases correctly', async () => {
    const loginResponse = await api.post('/api/login')
    //console.log('loginResponse', loginResponse.body)
    .send({
      username: 'pewdiepie',
      password: 'password'
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token
    const initialBlogs = await api.get('/api/blogs')
    const blogToDelete = initialBlogs.body[0]
    //console.log(initialBlogs, blogToDelete)

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const response = await api.get('/api/blogs')
    //console.log(response.body.length)
    assert.strictEqual(response.body.length, 1)
  })
  test('doesnt work when no token', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const blogToDelete = initialBlogs.body[0]
    //console.log(initialBlogs, blogToDelete)

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)
  })
  test('doesnt work when wrong token', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const blogToDelete = initialBlogs.body[0]
    //console.log(initialBlogs, blogToDelete)

    await api.delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer khskjghjsakhgkjweahkjg`)
      .expect(401)
  })

})

describe('PUT method', async () => {
  test('works and an entry is properly updated according to given parameters', async () => {
    const loginResponse = await api.post('/api/login')
    //console.log('loginResponse', loginResponse.body)
    .send({
      username: 'pewdiepie',
      password: 'password'
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token
    const initialBlogs = await api.get('/api/blogs')
    const blogToUpdateId = initialBlogs.body[0].id
    
    //console.log(blogToUpdateId)
    const action = await api.put(`/api/blogs/${blogToUpdateId}`)
      .set('Authorization', `Bearer ${token}`)
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
    const loginResponse = await api.post('/api/login')
    //console.log('loginResponse', loginResponse.body)
    .send({
      username: 'pewdiepie',
      password: 'password'
    })
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const token = loginResponse.body.token
    const initialBlogs = await api.get('/api/blogs')
    const blogToUpdateId = initialBlogs.body[0].id
    const blogOldLikes = initialBlogs.body[0].likes
    
    //console.log(blogToUpdateId)
    const action = await api.put(`/api/blogs/${blogToUpdateId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
      likes: blogOldLikes + 1
      })
      .expect(200)

    const updatedBlogs = await api.get('/api/blogs')
    //console.log(updatedBlogs.body)
    assert.strictEqual(updatedBlogs.body[0].likes, 4)    
  })
  test('works without token as expected currently', async () => {
    const initialBlogs = await api.get('/api/blogs')
    const blogToUpdateId = initialBlogs.body[0].id
    //console.log(blogToUpdateId)
    const blogOldLikes = initialBlogs.body[0].likes

    const action = await api.put(`/api/blogs/${blogToUpdateId}`)
      .send({
        likes: blogOldLikes + 1
      })
      .expect(200)
  })
})

// User tests begin

describe('Adding a user', async () => {
  test('initial user exist and is pewdiepie', async () => {
    const initUsers = await api.get('/api/users')
      .expect(200)
      //console.log(initUsers)
    
    assert.strictEqual(initUsers.body.length, 1)
    assert.strictEqual(initUsers.body[0].username, "pewdiepie")
  })
  test('works properly when parameters are valid', async () => {
    const action = await api.post('/api/users')
    .send({
      username: 'mororallaa',
      name: "Matti Morottaja",
      password: "pspspspsps"
    })

    const users = await api.get('/api/users')
      .expect(200)

    assert.strictEqual(users.body.length, 2)
    assert.strictEqual(users.body[1].username, "mororallaa")

  })
  test('does not work when username is too short', async () => {
    const action = await api.post('/api/users')
      .send({
        username: 'MA',
        name: "Matti Alanne",
        password: 'salasana'
      })
      .expect(400)

    const users = await api.get('/api/users')
    assert.strictEqual(users.body.length, 1)
  })
  test('does not work when password is too short', async () => {
    const action = await api.post('/api/users')
      .send({
        username: 'manummine',
        name: "Matti Alanne",
        password: 'sa'
      })
      .expect(400)

    const users = await api.get('/api/users')
    assert.strictEqual(users.body.length, 1)
    
  })
})



after(async () => {
  await mongoose.connection.close()
})