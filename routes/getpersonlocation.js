const express = require("express");
const mongoose = require("mongoose");
const UserLocation = require("../models/UserLocationModels");

const router = express.Router();

// GET user location by userId
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId"
      });
    }

    // ✅ 2. Find location
    const location = await UserLocation.findOne({ user: userId })
      .populate("user", "name email"); // optional

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found for this user"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        userId: location.user._id,
        latitude: location.latitude,
        longitude: location.longitude,
        updatedAt: location.updatedAt
      }
    });

  } catch (error) {
    console.error("Get location error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;