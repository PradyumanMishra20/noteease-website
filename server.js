// server.js — NoteEase Backend API with Gmail SMTP
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();
import { fileURLToPath } from "url";

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------
// Basic Setup
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// -------------------------
// Ensure uploads folder
// -------------------------
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// -------------------------
// Multer Setup
// -------------------------
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// -------------------------
// MySQL Connection
// -------------------------
let db;
const initDB = async () => {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log("✅ MySQL connected successfully!");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
};
initDB();
console.log("📌 Loaded env:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD ? "****" : "undefined",
  DB_NAME: process.env.DB_NAME
});


// -------------------------
// Gmail SMTP Setup
// -------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// -------------------------
// Routes
// -------------------------

// CONTACT
app.post("/api/contact", async (req, res) => {
  try {
    const { name, message } = req.body;

    if (!name || !message) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // Insert into DB
    const [result] = await db.query(
      "INSERT INTO contact_messages (name, message) VALUES (?, ?)",
      [name, message]
    );
    console.log("✅ DB Insert Success:", result);

    // Send Gmail
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "pradyuman212@gmail.com",
      subject: "📩 New Contact Message",
      text: `👤 Name: ${name}\n💬 Message: ${message}`,
    });
    console.log("✅ Email Sent:", info.messageId);

    res.json({ success: true, message: "Message submitted successfully!" });

  } catch (err) {
    console.error("❌ Contact error full details:", err); // THIS prints the real error
    res.status(500).json({ success: false, error: err.message });
  }
});


// WRITER
app.post("/api/writer", upload.single("writing_sample"), async (req, res) => {
  try {
    const { name, phone, education, motivation } = req.body;
    const file = req.file ? req.file.filename : null;

    await db.query(
      "INSERT INTO writer_applications (name, phone, education, writing_sample, motivation) VALUES (?, ?, ?, ?, ?)",
      [name, phone, education, file, motivation]
    );

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "pradyuman212@gmail.com",
      subject: "📝 New Writer Application",
      text: `👤 Name: ${name}\n📞 Phone: ${phone}\n🎓 Education: ${education}\n💭 Motivation: ${motivation}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// REQUEST
app.post("/api/request", async (req, res) => {
  try {
    const { name, phone, address, message } = req.body;

    await db.query(
      "INSERT INTO generic_requests (name, phone, address, message) VALUES (?, ?, ?, ?)",
      [name, phone, address, message]
    );

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "pradyuman212@gmail.com",
      subject: "📦 New NoteEase Request",
      text: `👤 Name: ${name}\n📞 Phone: ${phone}\n🏠 Address: ${address}\n💬 Message: ${message}`,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});


// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
