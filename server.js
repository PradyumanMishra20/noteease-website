// -------------------------
// server.js — NoteEase Backend (Railway Ready)
// -------------------------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// -------------------------
// Setup
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// File Upload Setup
// -------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// -------------------------
// MySQL Connection (Railway)
// -------------------------
let db;
const initDB = async () => {
  try {
    db = await mysql.createPool({
      uri: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    console.log("✅ MySQL connected successfully!");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
};
initDB();

// -------------------------
// Email Setup
// -------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// -------------------------
// Helper: Send Email
// -------------------------
async function sendEmail(subject, text, html) {
  try {
    await transporter.sendMail({
      from: `"NoteEase" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      text,
      html,
    });
    console.log("📩 Email sent successfully!");
  } catch (err) {
    console.error("❌ Email send error:", err);
  }
}

// -------------------------
// API: Order Form
// -------------------------
app.post("/api/order", upload.single("file"), async (req, res) => {
  try {
    const { name, email, topic, pages, budget, instructions } = req.body;
    const file = req.file ? req.file.filename : null;

    if (!name || !email || !topic) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    await db.query(
      "INSERT INTO orders (name, email, topic, pages, budget, instructions, file) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [name, email, topic, pages || 0, budget || 0, instructions || "", file]
    );

    await sendEmail(
      "🧾 New NoteEase Order",
      `New order from ${name} (${email})\nTopic: ${topic}`,
      `<b>New Order:</b><br>Name: ${name}<br>Email: ${email}<br>Topic: ${topic}<br>Pages: ${pages}<br>Budget: ${budget}`
    );

    res.json({ success: true, message: "Order submitted successfully!" });
  } catch (err) {
    console.error("❌ Order error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------
// API: Contact Form
// -------------------------
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    await db.query(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    await sendEmail(
      "📩 New Contact Message",
      `From: ${name} (${email})\nMessage: ${message}`,
      `<b>From:</b> ${name} (${email})<br><b>Message:</b> ${message}`
    );

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ Contact error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------
// API: Writer Form
// -------------------------
app.post("/api/writer", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, qualification, experience } = req.body;
    const resume = req.file ? req.file.filename : null;

    if (!name || !email || !qualification) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    await db.query(
      "INSERT INTO writers (name, email, qualification, experience, resume) VALUES (?, ?, ?, ?, ?)",
      [name, email, qualification, experience || "", resume]
    );

    await sendEmail(
      "✍️ New Writer Application",
      `New writer: ${name} (${email})`,
      `<b>Name:</b> ${name}<br><b>Email:</b> ${email}<br><b>Qualification:</b> ${qualification}`
    );

    res.json({ success: true, message: "Application submitted successfully!" });
  } catch (err) {
    console.error("❌ Writer error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// -------------------------
// Default Route
// -------------------------
app.get("/", (req, res) => {
  res.send("🚀 NoteEase Backend is running successfully on Railway!");
});

// -------------------------
// Server Start
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
