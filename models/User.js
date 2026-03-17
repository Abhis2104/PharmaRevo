const mongoose = require("mongoose")

// Schema = the shape/structure of a User document in MongoDB
const userSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true        // This field MUST be provided
  },

  email: {
    type: String,
    required: true,
    unique: true          // No two users can have the same email
  },

  password: {
    type: String,
    required: true
  },

  // Role decides what dashboard the user sees after login
  role: {
    type: String,
    enum: ["donor", "ngo", "admin", "pharmacy", "corporate"],
    default: "donor"      // If no role given, assume donor
  }

}, { timestamps: true })  // Automatically adds createdAt and updatedAt fields

// Export so server.js and routes can use it
module.exports = mongoose.model("User", userSchema)
