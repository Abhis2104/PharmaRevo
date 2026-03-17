// Run this ONCE to create the admin account
// Command: node createAdmin.js
// After running, DELETE this file for security

const mongoose = require("mongoose")
const bcrypt   = require("bcryptjs")
require("dotenv").config()

const User = require("./models/User")

async function createAdmin() {

  await mongoose.connect(process.env.MONGO_URI)

  // Check if admin already exists
  const existing = await User.findOne({ email: "admin@pharmarevo.com" })
  if (existing) {
    console.log("Admin already exists!")
    process.exit()
  }

  const hashed = await bcrypt.hash("admin123", 10)

  await User.create({
    name:     "PharmaRevo Admin",
    email:    "admin@pharmarevo.com",
    password: hashed,
    role:     "admin"
  })

  console.log("✅ Admin created!")
  console.log("   Email:    admin@pharmarevo.com")
  console.log("   Password: admin123")
  console.log("   Change this password after first login!")

  process.exit()
}

createAdmin()
