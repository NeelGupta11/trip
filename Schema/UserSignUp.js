const mongoose = require("mongoose");

const SignUpDetailSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: { type: String, required: true }
  },
  { timestamps: true }
);  

module.exports = SignUpDetailSchema
