
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0);
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null;

  return blogs.reduce((prev, current) => (prev.likes > current.likes) ? prev : current);
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const authorBlogCount = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + 1
    return acc
  }, {})

  const maxBlogsAuthor = Object.keys(authorBlogCount).reduce((a, b) => 
    authorBlogCount[a] > authorBlogCount[b] ? a : b
  )

  return {
    author: maxBlogsAuthor,
    blogs: authorBlogCount[maxBlogsAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const authorLikesCount = blogs.reduce((acc, blog) => {
    acc[blog.author] = (acc[blog.author] || 0) + blog.likes
    return acc
  }, {})

  const maxLikesAuthor = Object.keys(authorLikesCount).reduce((a, b) => 
    authorLikesCount[a] > authorLikesCount[b] ? a : b
  )

  return {
    author: maxLikesAuthor,
    likes: authorLikesCount[maxLikesAuthor]
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}