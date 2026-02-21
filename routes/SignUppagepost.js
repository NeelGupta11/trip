const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const SignUpDetail = require('../models/UserSignUpmodel');

router.post('/signuppost', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await SignUpDetail.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // 🔐 Hash password ONCE
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save user
    const user = new SignUpDetail({
      firstName,
      lastName,
      email,
      password: hashedPassword
    });

    await user.save();
     res.json({ message: "User saved Successfully" });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;
