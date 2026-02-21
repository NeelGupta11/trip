const Group = require("../models/GroupModel");
const SignUpDetail = require("../models/UserSignUpmodel");
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/join-group", async (req, res) => {
  try {
    const { groupCode, userId } = req.body || {};

    // ✅ 1. Validate input
    if (!groupCode || !userId) {
      return res.status(400).json({
        success: false,
        message: "Group code and userId are required"
      });
    }

    // ✅ 2. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // ✅ 3. Check if user exists
    const user = await SignUpDetail.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ 4. Find group
    const group = await Group.findOne({ groupCode: groupCode.trim().toUpperCase() });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // ✅ 5. Prevent duplicate join (ObjectId safe comparison)
    const alreadyMember = group.members.some(
      member => member.toString() === userId
    );

    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "User already in group"
      });
    }

    // ✅ 6. Optional: Limit group size
    const MAX_MEMBERS = 50;
    if (group.members.length >= MAX_MEMBERS) {
      return res.status(400).json({
        success: false,
        message: "Group is full"
      });
    }

    // ✅ 7. Add user
    group.members.push(userId);
    await group.save();

    res.status(200).json({
      success: true,
      message: "Joined group successfully",
      group
    });

  } catch (err) {
    console.error("Join Group Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;