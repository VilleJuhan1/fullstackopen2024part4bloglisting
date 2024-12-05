const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

const blogs = [
  {
    "title": "Jännittävä kasvisruokablogi",
    "author": "Venla Vegaani",
    "url": "www.lihaton.com",
    "likes": 3,
    "id": "674de506045d215735ebc096"
  },
  {
    "title": "Jännittävä liharuokablogi",
    "author": "Laila Lihansyöjä",
    "url": "www.lihaaon.com",
    "likes": 5,
    "id": "674deb4b477be664dd515d44"
  },
  {
    "title": "Keskinkertainen kalaruokablogi",
    "author": "Kalle Kalastaja",
    "url": "www.lihaaonkalakin.com",
    "likes": 4,
    "id": "674f2397da366ec16e5fda57"
  }
]

test('dummy returns one', () => {

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,
      __v: 0
    }
  ]

  const emptyList = []

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('of empty list is zero'), () => {
    const result = listHelper.totalLikes(emptyList)
    assert.strictEqual(result, 0)
  }

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(blogs)
    assert.strictEqual(result, 12)
  })
})

