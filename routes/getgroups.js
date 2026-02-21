const express = require("express");
const mongoose = require("mongoose");
const Group = require("../models/GroupModel");

const router = express.Router();

// GET all groups where user is a member
router.get("/user/:userId/groups", async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("hello")
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId"
      });
    }

    const groups = await Group.find({ members: userId });
      // .populate("admin", "firstName lastName") // Fixed to match your schema fields
      // .select("groupName groupCode admin createdAt");
    // ✅ NEW CHECK: If array is empty, return "no group join"
    if (!groups || groups.length === 0) {
      return res.status(200).json({
        success: true,
        message: "no group join", // Your custom message
        totalGroups: 0,
        groups: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Groups fetched successfully",
      totalGroups: groups.length,
      groups
    });

  } catch (error) {
    console.error("Get user groups error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;