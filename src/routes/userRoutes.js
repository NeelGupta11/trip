const express = require("express");
const router = express.Router();
// const { getUsers, createUser } = require("../controllers/userController");

router.get("/", (req, res) => {
  res.json({ message: "All users fetched" });
});

router.post("/", (req, res) => {
  const { name } = req.body;
  res.json({ message: `${name} created successfully` });
});

module.exports = router;
