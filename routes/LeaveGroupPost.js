const Group = require("../models/GroupModel");
const SignUpDetail = require("../models/UserSignUpmodel");
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/leave-group", async (req, res) => {
  try {
    const { groupId, userId } = req.body || {};

    // ✅ 1. Validate input
    if (!groupId || !userId) {
      return res.status(400).json({
        success: false,
        message: "groupId and userId are required"
      });
    }

    // ✅ 2. Validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(groupId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid groupId or userId"
      });
    }

    // ✅ 3. Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    // ✅ 4. Check if user exists
    const user = await SignUpDetail.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // ✅ 5. Check if user is member
    const isMember = group.members.some(
      member => member.toString() === userId
    );

    if (!isMember) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this group"
      });
    }

    // ✅ 6. If user is ADMIN
    if (group.admin.toString() === userId) {
      
      // If only one member → delete group
      if (group.members.length === 1) {
        await Group.findByIdAndDelete(groupId);
        return res.json({
          success: true,
          message: "Group deleted as admin left"
        });
      }

      // Transfer admin to next member
      const newAdmin = group.members.find(
        member => member.toString() !== userId
      );

      group.admin = newAdmin;
    }

    // ✅ 7. Remove user from members
    group.members = group.members.filter(
      member => member.toString() !== userId
    );

    await group.save();

    res.status(200).json({
      success: true,
      message: "Left group successfully",
      group
    });

  } catch (err) {
    console.error("Leave Group Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;