// -------------------------
// Import dependencies
// -------------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

// -------------------------
// Config
// -------------------------
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------
// Middleware setup
// -------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Fixed CORS configuration
app.use(
  cors({
    origin: [
      "https://pradyumanmishra20.github.io", // GitHub Pages frontend
      "http://localhost:3000",               // Local testing
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------------
// Database Connection
// -------------------------
let db;
(async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
    console.log("✅ MySQL connected successfully!");
  } catch (err) {
    console.error("❌ Database connection error:", err);
  }
})();

// -------------------------
// Nodemailer setup
// -------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -------------------------
// Routes
// -------------------------

// 🧾 Writer Application Form
app.post("/api/writer-application", async (req, res) => {
  try {
    const { name, email, experience, sample_link } = req.body;

    if (!name || !email || !experience) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO writer_applications (name, email, experience, sample_link)
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [name, email, experience, sample_link || ""]);

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Writer Application – NoteEase",
      text: `Name: ${name}\nEmail: ${email}\nExperience: ${experience}\nSample: ${sample_link || "N/A"}`,
    });

    res.status(200).json({ message: "Writer application submitted successfully" });
  } catch (err) {
    console.error("❌ Error submitting writer application:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 💬 Generic Requests Form
app.post("/api/generic-request", async (req, res) => {
  try {
    const { name, email, topic, message } = req.body;

    if (!name || !email || !topic || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const query = `
      INSERT INTO generic_requests (name, email, topic, message)
      VALUES (?, ?, ?, ?)
    `;
    await db.execute(query, [name, email, topic, message]);

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: "New Generic Request – NoteEase",
      text: `Name: ${name}\nEmail: ${email}\nTopic: ${topic}\nMessage: ${message}`,
    });

    res.status(200).json({ message: "Request submitted successfully" });
  } catch (err) {
    console.error("❌ Error submitting request:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// -------------------------
// Default Route
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 NoteEase backend is running!");
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
