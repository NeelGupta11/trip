const mongoose = require("mongoose");
const { atlasConn } = require("../config/db");

const GroupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true
  },

  groupCode: {
    type: String,
    unique: true
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SignUpDetail",
    required: true
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SignUpDetail"
    }
  ]

}, { timestamps: true });


module.exports = GroupSchema;