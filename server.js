// ✅ server.js — NoteEase Backend API with Email Notifications
// ✅ server.js — Fixed CORS for GitHub Pages + Railway
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import nodemailer from "nodemailer";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Hardcore CORS fix (works even if Railway blocks preflight)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://pradyumanmishra20.github.io");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // respond to preflight immediately
  }
  next();
});

// ✅ Basic setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// ✅ Check if uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// -------------------------
// Multer Setup
// -------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|doc|docx|txt/;
    const ext = path.extname(file.originalname).toLowerCase();
    allowed.test(ext) ? cb(null, true) : cb(new Error("Invalid file type"));
  },
});

// -------------------------
// ✅ MySQL Connection (Railway)
// -------------------------
let db;
const initDB = async () => {
  try {
    db = await mysql.createPool({
      host: "mysql.railway.internal",
      user: "root",
      password: "DiBCrmcEHvQvrUipelILmekKIgnXorlb",
      database: "railway",
      port: 3306,
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

// -------------------------
// ✅ Nodemailer Setup
// -------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "noteeaseofficial@gmail.com", // your Gmail
    pass: "hxxf dmaj fcpm wvqr", // Gmail App Password
  },
});

// Utility to send notification email
const sendNotification = async (subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"NoteEase Notifications" <noteeaseofficial@gmail.com>`,
      to: "noteeaseofficial@gmail.com", // send to yourself
      subject,
      html: htmlContent,
    });
    console.log(`📩 Email sent: ${subject}`);
  } catch (err) {
    console.error("❌ Email send error:", err);
  }
};

// -------------------------
// ✅ ROUTES
// -------------------------

// Contact Form
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, message: "All fields are required!" });

    await db.query(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    await sendNotification(
      "📬 New Contact Message",
      `<h3>New message from ${name}</h3>
       <p><b>Email:</b> ${email}</p>
       <p><b>Message:</b> ${message}</p>`
    );

    res.json({ success: true, message: "Message submitted successfully!" });
  } catch (err) {
    console.error("❌ Contact error:", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// Writer Form
app.post("/api/writer", upload.single("writing_sample"), async (req, res) => {
  try {
    const { name, email, phone, education, motivation } = req.body;
    const writing_sample = req.file ? req.file.filename : "No file uploaded";

    await db.query(
      "INSERT INTO writer_applications (name, email, phone, education, writing_sample, motivation) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone, education, writing_sample, motivation || ""]
    );

    await sendNotification(
      "📝 New Writer Application",
      `<h3>Writer: ${name}</h3>
       <p><b>Email:</b> ${email}</p>
       <p><b>Phone:</b> ${phone}</p>
       <p><b>Education:</b> ${education}</p>
       <p><b>Motivation:</b> ${motivation}</p>
       <p><b>Sample File:</b> ${writing_sample}</p>`
    );

    res.json({ success: true, message: "Application submitted successfully!" });
  } catch (err) {
    console.error("❌ Writer error:", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// Request Form
app.post("/api/request", async (req, res) => {
  try {
    const { name, phone, address, message } = req.body;
    if (!name || !phone || !address || !message)
      return res.status(400).json({ success: false, message: "All fields are required!" });

    await db.query(
      "INSERT INTO generic_requests (name, phone, address, message) VALUES (?, ?, ?, ?)",
      [name, phone, address, message]
    );

    await sendNotification(
      "📦 New Request Form",
      `<h3>Request from ${name}</h3>
       <p><b>Phone:</b> ${phone}</p>
       <p><b>Address:</b> ${address}</p>
       <p><b>Message:</b> ${message}</p>`
    );

    res.json({ success: true, message: "Request submitted successfully!" });
  } catch (err) {
    console.error("❌ Request error:", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


