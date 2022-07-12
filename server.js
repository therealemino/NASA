const http = require('http')
require("dotenv").config()
const { mongoConnect } = require('./src/services/mongo');

const app = require('./src/app')
const { loadPlanetsData } = require('./src/models/planets.model');
const { loadSpaceXLaunchData } = require('./src/models/launches.model');

const PORT = process.env.PORT || 8000

const server = http.createServer(app)

async function startServer() {
  await mongoConnect()
  await loadPlanetsData()
  await loadSpaceXLaunchData()
}


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})

startServer()
