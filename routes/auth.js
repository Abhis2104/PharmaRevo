const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/User")  // Go up one folder, then into models

/* ─── SIGNUP ─────────────────────────────────────────── */

router.post("/signup", async (req, res) => {

  try {

    const { name, email, password, role } = req.body

    // Check if email already registered
    const existing = await User.findOne({ email })
    if (existing) {
      return res.json({ status: "error", message: "Email already registered" })
    }

    // Hash the password — bcrypt turns "hello123" into "$2b$10$xyz..."
    // The number 10 is the "salt rounds" — higher = more secure but slower
    const hashed = await bcrypt.hash(password, 10)

    // Save user with hashed password, never the raw one
    const user = new User({ name, email, password: hashed, role })
    await user.save()

    res.json({ status: "success", message: "Account created successfully" })

  } catch (err) {
    res.json({ status: "error", message: err.message })
  }

})

/* ─── LOGIN ──────────────────────────────────────────── */

router.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.json({ status: "error", message: "Invalid email or password" })
    }

    // Compare entered password with the hashed one in DB
    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.json({ status: "error", message: "Invalid email or password" })
    }

    // Create a JWT token — this proves the user is logged in
    // It contains the user's id and role, expires in 1 day
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    )

    res.json({
      status: "success",
      token,               // Send token to frontend to store
      role: user.role,     // Frontend uses this to redirect to correct dashboard
      name: user.name
    })

  } catch (err) {
    res.json({ status: "error", message: err.message })
  }

})

/* ─── GET ALL USERS (Admin only) ────────────────────── */

router.get("/users", async (req, res) => {
  try {
    // Return all users but never send passwords
    const users = await User.find({}, "-password")
    res.json(users)
  } catch (err) {
    res.json({ status: "error", message: err.message })
  }
})

module.exports = router
