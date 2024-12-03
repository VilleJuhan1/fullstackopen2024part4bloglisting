const app = require('./app') // The Express app
const config = require('./utils/config')
//const logger = require('./utils/logger')

app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`)
})