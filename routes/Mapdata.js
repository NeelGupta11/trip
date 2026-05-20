const express = require("express");
const router = express.Router();
const MapData = require("../models/MapDataModel");

// PATCH → Add location
router.patch("/map/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, latitude, longitude } = req.body;

    if (!latitude || !longitude || !title) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedMap = await MapData.findOneAndUpdate(
      { group: groupId },
      {
        $push: {
          locations: {
            addedBy: req.user?.id || null, // if using JWT middleware
            title,
            description,
            latitude,
            longitude,
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Location added successfully",
      data: updatedMap,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET → Get all locations of a group
router.get("/map/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;

    const mapData = await MapData.findOne({ group: groupId })
      .populate("locations.addedBy", "name email");

    if (!mapData) {
      return res.status(404).json({ message: "No locations found" });
    }

    res.status(200).json(mapData);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;