const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()       // Load .env variables into process.env

const app = express()

/* ─── MIDDLEWARE ─────────────────────────────────────── */
// Middleware = functions that run on every request before reaching routes

app.use(cors())                  // Allow frontend to call this backend
app.use(express.json())          // Parse incoming JSON request bodies
app.use(express.static("public")) // Serve HTML/CSS/JS files from public folder

/* ─── ROUTES ─────────────────────────────────────────── */

app.use("/api/auth", require("./routes/auth"))
// All auth routes now live at /api/auth/signup and /api/auth/login

/* ─── DATABASE CONNECTION ────────────────────────────── */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err))

/* ─── START SERVER ───────────────────────────────────── */

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`PharmaRevo server running on http://localhost:${PORT}`)
})
