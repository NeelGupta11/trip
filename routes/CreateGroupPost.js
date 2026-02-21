const Group = require("../models/GroupModel");
const SignUpDetail = require("../models/UserSignUpmodel");
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/create-group", async (req, res) => {
  try {
    const { groupName, adminId } = req.body || {};

    // ✅ 1. Check required fields
    if (!groupName || !adminId) {
      return res.status(400).json({
        success: false,
        message: "Group name and adminId are required"
      });
    }

    // ✅ 2. Prevent empty string group name
    if (groupName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Group name must be at least 3 characters"
      });
    }

    // ✅ 3. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin ID"
      });
    }

    // ✅ 4. Check if admin user exists
    const adminUser = await SignUpDetail.findById(adminId);
    if (!adminUser) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found"
      });
    }

    // ✅ 5. Optional: Prevent duplicate group name for same admin
    const existingGroup = await Group.findOne({
      groupName: groupName.trim(),
      admin: adminId
    });

    if (existingGroup) {
      return res.status(400).json({
        success: false,
        message: "You already created a group with this name"
      });
    }

    // ✅ 6. Generate unique group code (avoid collision)
    let groupCode;
    let codeExists = true;

    while (codeExists) {
      groupCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      const existingCode = await Group.findOne({ groupCode });
      if (!existingCode) codeExists = false;
    }

    // ✅ 7. Create group
    const group = new Group({
      groupName: groupName.trim(),
      groupCode,
      admin: adminId,
      members: [adminId]
    });

    await group.save();

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group
    });

  } catch (err) {
    console.error("Create Group Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

module.exports = router;