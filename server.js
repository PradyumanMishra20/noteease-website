// server.js — NoteEase (railway-ready, CORS + multer + mysql)
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CORS (explicit)
const allowedOrigins = [
  "https://pradyumanmishra20.github.io",
  "http://localhost:3000",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

// simple request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- multer (file uploads)
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

// --- MySQL init
let db;
const initDB = async () => {
  try {
    if (process.env.DATABASE_URL) {
      // parse DATABASE_URL or let mysql2 accept it
      db = await mysql.createPool({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
      });
    } else {
      db = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
        waitForConnections: true,
        connectionLimit: 10,
      });
    }
    console.log("✅ MySQL connected successfully!");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
};
initDB();

// --- Mailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(subject, text, html) {
  try {
    await transporter.sendMail({
      from: `"NoteEase" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject,
      text,
      html,
    });
    console.log("📩 Email sent:", subject);
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

// --- Contact
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, message: "Missing fields" });

    await db.query(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)",
      [name, email, message]
    );

    await sendEmail(
      "📩 New Contact Message",
      `From: ${name} (${email})\n${message}`,
      `<b>From:</b> ${name} (${email})<br/><b>Message:</b><br/>${message}`
    );

    res.json({ success: true, message: "Message saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Writer (multipart/form-data expected)
app.post("/api/writer", upload.single("resume"), async (req, res) => {
  try {
    const { name, email, qualification, experience } = req.body;
    const resume = req.file ? req.file.filename : null;
    if (!name || !email || !qualification)
      return res.status(400).json({ success: false, message: "Missing fields" });

    await db.query(
      "INSERT INTO writer_applications (name, email, qualification, experience, resume) VALUES (?, ?, ?, ?, ?)",
      [name, email, qualification, experience || "", resume]
    );

    await sendEmail(
      "✍️ New Writer Application",
      `Name: ${name}\nEmail: ${email}\nQualification: ${qualification}`,
      `<b>Name:</b> ${name}<br/><b>Email:</b> ${email}<br/><b>Qualification:</b> ${qualification}`
    );

    res.json({ success: true, message: "Application saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// --- Generic Request
app.post("/api/request", async (req, res) => {
  try {
    const { name, phone, address, message } = req.body;
    if (!name || !phone || !address)
      return res.status(400).json({ success: false, message: "Missing fields" });

    await db.query(
      "INSERT INTO generic_requests (name, phone, address, message) VALUES (?, ?, ?, ?)",
      [name, phone, address, message || ""]
    );

    await sendEmail(
      "📦 New Generic Request",
      `Name: ${name}\nPhone: ${phone}\nAddress: ${address}`,
      `<b>Name:</b> ${name}<br/><b>Phone:</b> ${phone}<br/><b>Address:</b> ${address}<br/><b>Message:</b>${message}`
    );

    res.json({ success: true, message: "Request saved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/", (req, res) => res.send("🚀 NoteEase backend running"));
app.listen(PORT, () => console.log(`Server on ${PORT}`));
