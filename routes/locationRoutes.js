const express = require("express");
const mongoose = require("mongoose");
const UserLocation = require("../models/UserLocationModels");

const router = express.Router();

router.patch("/update-location", async (req, res) => {
  try {
    const { userId, latitude, longitude } = req.body || {};

    // ✅ 1. Validate required fields
    if (!userId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, latitude and longitude are required"
      });
    }

    // ✅ 2. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId"
      });
    }

    // ✅ 3. Validate latitude & longitude type + range
    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 || latitude > 90 ||
      longitude < -180 || longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude values"
      });
    }

    // ✅ 4. Update if exists, create if not (UPSERT)
    const location = await UserLocation.findOneAndUpdate(
      { user: userId },
      {
        latitude,
        longitude,
        updatedAt: Date.now()
      },
      {
        new: true,
        upsert: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      data: location
    });

  } catch (error) {
    console.error("Location update error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;