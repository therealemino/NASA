const launches = require('./launches.mongo');
const planets = require('./planets.mongo');
const axios = require('axios');

const DEFAULT_FLIGHT_NUMBER = 100

const launch = {
  flightNumber: 100, //flight_number
  mission: "Kepler Exploration X", // name
  rocket: "Explorer IS1", // rocket.name (in space X api response)
  launchDate: new Date("December 27, 2030"), // date_local
  target: "Kepler-442 b",  // not applicable
  customers: ["Emino", "NASA"], // payload.customers
  upcoming: true, //upcoming
  success: true // success
}

saveLaunch(launch)

const SPACE_X_API_URL = "https://api.spacexdata.com/v4/launches/query"

async function populateLaunches() {
  console.log("Downloading data from Space X Api");
  const response = await axios.post(SPACE_X_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
          {
              path: "rocket",
              select: {
                  name: 1
              }
          },
          {
            path: "payloads",
            select: {
              customers: 1
            }
          }
      ]
    }
  })

  if(response.status !== 200) {
    console.log("Problem Downloading launch data");
    throw new Error("Launch data downoad failed")
  }

  const launchDocs = response.data.docs
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc.payloads
    const customers = payloads.flatMap((payload) => {
      return payload.customers
    })

    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc.date_local,
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers
    }
    console.log(launch);

    await saveLaunch(launch)
  }
}

async function loadSpaceXLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat"
  })
  if(firstLaunch) {
    console.log("Space X Launch data already loaded");
  } else {
    populateLaunches()
  }
}

async function findLaunch(filter) {
  return await launches.findOne(filter)
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate({
    flightNumber: launch.flightNumber
  }, launch, {
    upsert: true
  })
}

async function getAllLaunches(skip, limit) {
  const res = await launches.find({}, { "_id": 0, "__v": 0 })
    .sort({ flightNumber: -1 })
    .skip(skip)
    .limit(limit)
  return res
}

async function getLatestFlightNo() {
  const latestLaunch = await launches
    .findOne()
    .sort("-flightNumber")

  if(!latestLaunch)  {
    return DEFAULT_FLIGHT_NUMBER
  }

  return latestLaunch.flightNumber
}

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({ keplerName: launch.target })
  if(!planet) {
    throw new Error("No matching planets found")
  }

  const newFlightNumber = await getLatestFlightNo() + 1
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Emino', 'NASA'],
    flightNumber: newFlightNumber
  })

  await saveLaunch(newLaunch)
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  })
}

async function abortLaunchById(launchId) {
  // instead of deleting the utem from the database (not recommended), pass a boolean property and set true or false
  const aborted =  await launches.updateOne({
    flightNumber: launchId
  }, {
    upcoming: false,
    success: false
  })

  return aborted.acknowledged && aborted.modifiedCount === 1
}

module.exports = {
  getAllLaunches,
  existsLaunchWithId,
  abortLaunchById,
  scheduleNewLaunch,
  loadSpaceXLaunchData
}
