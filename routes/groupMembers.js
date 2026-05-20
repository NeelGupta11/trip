const express = require("express");
const router = express.Router();

const Group = require("../models/GroupModel");

router.get("/:groupId/members", async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId)
      .populate("members", "firstName email");

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    res.json({
      success: true,
      members: group.members
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;