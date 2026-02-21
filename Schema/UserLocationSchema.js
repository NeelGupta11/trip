const mongoose = require("mongoose");
const { atlasConn } = require("../config/db");

const UserLocationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SignUpDetail",
    required: true,
    unique: true   // One location per user
  },

  latitude: {
    type: Number,
    required: true
  },

  longitude: {
    type: Number,
    required: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

// Optional: Add geo index (VERY IMPORTANT for future features)
UserLocationSchema.index({ latitude: 1, longitude: 1 });


module.exports = UserLocationSchema;