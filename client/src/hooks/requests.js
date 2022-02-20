const baseUrl = 'http://localhost:8000/v1'

async function httpGetPlanets() { // Load planets and return as JSON
  const res = await fetch(`${baseUrl}/planets`)
  return await res.json()
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const res = await fetch(`${baseUrl}/launches`)
  const fetchedLaunches = await res.json()
  return fetchedLaunches.sort((a,b) => {
    return a.flightNumber - b.flightNumber
  })
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    const response = await fetch(`${baseUrl}/launches`, {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(launch)
    })
    return response
  }
  catch(err) {
    return {
      ok: false
    }
  }
}

async function httpAbortLaunch(id) {
  // Delete launch with given ID.
  try {
    return await fetch(`${baseUrl}/launches/${id}`, {
      method: "delete"
    })
  }
  catch(err) {
    console.log(err)
    return {
      ok: false
    }
  }
}

export {
  httpGetPlanets,
  httpGetLaunches,
  httpSubmitLaunch,
  httpAbortLaunch,
};
