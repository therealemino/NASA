const { parse } = require('csv-parse')
const fs = require('fs')
const path = require('path');
const planets = require('./planets.mongo');

// let habitablePlanets = []

function isHabitable(planet) {
  return planet['koi_disposition'] === 'CONFIRMED'
    && planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6
}

function loadPlanetsData() {
  return new Promise(function(resolve, reject) {
    fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'kepler.csv'))
    .pipe(parse({
      comment: '#',
      columns: true
    }))
    .on('data', async (data) => {
      if (isHabitable(data)) {
        savePlanet(data)
      }
    })
    .on('error', (err) => {
      console.log(err);
      reject(err)
    })
    .on('end', async () => {
      const countPlanetsFound = (await getAllPlanets()).length
      console.log(`Loaded planets data succesfully. ${countPlanetsFound} planets found`);
      resolve()
    })

  });
}

async function getAllPlanets () {
  return await planets.find({})
}

async function savePlanet(planet) {
  try {
    await planets.updateOne({
      keplerName: planet.kepler_name
    }, {
      keplerName: planet.kepler_name
    }, {
      upsert: true
    })
  } catch (err) {
    console.error(`Couldn't save planet to Mongo: ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
}
