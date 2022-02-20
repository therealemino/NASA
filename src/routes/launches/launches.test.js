const request = require('supertest');
const app = require('../../app');
const { mongoConnect,mongoDisconnect } = require('../../services/mongo');

describe("Launches API", () => {

  beforeAll(async () => {
    await mongoConnect()
  })

  afterAll(async () => {
    await mongoDisconnect()
  })

  describe("Test GET /launchess", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
      .get("/v1/launches")
      .expect(200)
      .expect("Content-Type", /json/)
      // expect(response.statusCode).toBe(200)
    })
  })


  describe("Test POST /launchess", () => {
    const testData = {
      mission: "Emino Kepler Mission",
      rocket: "JFK-OFF-ED1",
      target: "Kepler-442 b",
      launchDate: "October 4, 2023"
    }

    const testDataWithoutDate = {
      mission: "Emino Kepler Mission",
      rocket: "JFK-OFF-ED1",
      target: "Kepler-442 b"
    }

    const testDataWithInvalidDate = {
      mission: "Emino Kepler Mission",
      rocket: "JFK-OFF-ED1",
      target: "Kepler-442 b",
      launchDate: "October 4th 2023"
    }

    test("It should respond with 201 created", async () => {
      const response = await request(app)
      .post("/v1/launches")
      .send(testData)
      .expect("Content-Type", /json/)
      .expect(201)

      const requestDate = new Date(testData.launchDate).valueOf()
      const responseDate = new Date (response.body.launchDate).valueOf()

      expect(response.body).toMatchObject(testDataWithoutDate)
      expect(responseDate).toBe(requestDate)
    })

    test("It should catch missing required properties", async () => {
      const response = await request(app)
      .post("/v1/launches")
      .send(testDataWithoutDate)
      .expect("Content-Type", /json/)
      .expect(400)

      expect(response.body).toStrictEqual({
        error: "Missing required launch property"
      })
    })

    test("It should catch invalid dates", async () => {
      const response = await request(app)
      .post("/v1/launches")
      .send(testDataWithInvalidDate)
      .expect("Content-Type", /json/)
      .expect(400)

      expect(response.body).toStrictEqual({
        error: "Invalid launch date"
      })
    })
  })
})
