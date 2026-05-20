const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({

  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },

  title: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SignUpDetail",
    required: true
  },

  splitBetween: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SignUpDetail"
      },

      amount: {
        type: Number,
        default: 0
      }
    }
  ],

  contributions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SignUpDetail"
      },

      amount: {
        type: Number,
        default: 0
      }
    }
  ]

}, { timestamps: true });

module.exports = ExpenseSchema