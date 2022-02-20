const mongoose = require('mongoose');

const launchesSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
    // min: 100,
    // max: 999
  },
  mission: {
    type: String,
    required: true
  },
  rocket: {
    type: String,
    required: true
  },
  launchDate: {
    type: Date,
    required: true
  },
  target: {
    // type: mongoose.ObjectId,
    // ref: "Planet"
    type: String,
  },
  customers: [ String ],
  upcoming: {
    type: Boolean,
    required: true
  },
  success: {
    type: Boolean,
    required: true,
    default: true
  }
})

// Connects launchesSchema with the "launches" collection
module.exports = mongoose.model('Launch', launchesSchema)
