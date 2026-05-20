const mongoose = require("mongoose");
const { atlasConn } = require("../config/db");
// ======================================================
// SETTLEMENT MODEL
// Tracks when one group member pays another back.
// These are subtracted from expense-derived debts in
// the /group-balance and /user-balance routes.
// ======================================================

const SettlementSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true
    },

    // The person who PAID (is clearing their debt)
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SignUpDetail",
      required: true
    },

    // The person who RECEIVED the payment
    paidTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SignUpDetail",
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"]
    },

    note: {
      type: String,
      default: "",
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = atlasConn.model("Settlement", SettlementSchema);