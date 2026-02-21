  const express = require("express");
  const mongoose = require("mongoose");
  const Group = require("../models/GroupModel");
  const UserLocation = require("../models/UserLocationModels");

  const router = express.Router();

  router.get("/group/:groupId/locations", async (req, res) => {
    try {
      const { groupId } = req.params;

      // ✅ 1. Validate groupId
      if (!mongoose.Types.ObjectId.isValid(groupId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid groupId"
        });
      }

      // ✅ 2. Find group
      const group = await Group.findById(groupId).populate(
        "members",
        "name email"
      );

      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found"
        });
      }

      // ✅ 3. Get all member IDs
      const memberIds = group.members.map(member => member._id);

      // ✅ 4. Find locations of all members
      const locations = await UserLocation.find({
        user: { $in: memberIds }
      }).populate("user", "name email");

      return res.status(200).json({
        success: true,
        groupName: group.groupName,
        totalMembers: group.members.length,
        totalActiveLocations: locations.length,
        locations
      });

    } catch (error) {
      console.error("Get group locations error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  });

  module.exports = router;