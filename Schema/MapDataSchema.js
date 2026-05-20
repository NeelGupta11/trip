const mongoose = require("mongoose");

const MapDataSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
    unique: true   
  },

  locations: [
    {
      addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SignUpDetail",
        required: true
      },

      title: {
        type: String,
        required: true
      },

      description: {
        type: String
      },

      latitude: {
        type: Number,
        required: true
      },

      longitude: {
        type: Number,
        required: true
      },

      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = MapDataSchema;