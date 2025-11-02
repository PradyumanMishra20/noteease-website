// ✅ server.js — NoteEase Backend API with Resend Email Notifications + Autoresponder
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import mysql from "mysql2/promise";
import { fileURLToPath } from "url";
import { Resend } from "resend";

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------
// Setup
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Allowed Origins
const allowedOrigins = [
  "https://pradyumanmishra20.github.io",
  "https://noteease.up.railway.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
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
  destination: (req, file, cb) => cb(null, uploadDir),
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
      host: "trolley.proxy.rlwy.net",
      port: 14143,
      user: "root",
      password: "DiBCrmcEHvQvrUipelILmekKIgnXorlb",
      database: "railway",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: { rejectUnauthorized: false },
    });

    console.log("✅ MySQL connected successfully!");

    await db.query(`
      CREATE TABLE IF NOT EXISTS generic_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        address VARCHAR(255) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS writer_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        education VARCHAR(255) NOT NULL,
        writing_sample VARCHAR(255),
        motivation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("🛠️ Ensured all tables exist");
  } catch (err) {
    console.error("❌ MySQL connection failed:", err);
  }
};
initDB();

// -------------------------
// Resend Setup
// -------------------------
const resend = new Resend(process.env.RESEND_API_KEY);
const AUTO_REPLY_EMAIL = "NoteEase <noreply@noteease.in>"; // Replace with verified domain

// -------------------------
// Routes
// -------------------------
app.options("/api/contact", cors(corsOptions));
app.options("/api/writer", cors(corsOptions));
app.options("/api/order", cors(corsOptions));
app.options("/api/request", cors(corsOptions));

// ✅ CONTACT FORM
app.post("/api/contact", async (req, res) => {
  try {
    const { name, message, email } = req.body;
    if (!name || !message)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });

    await db.query("INSERT INTO contact_messages (name, message) VALUES (?, ?)", [
      name,
      message,
    ]);

    // 🔔 Send admin notification
    await resend.emails.send({
      from: AUTO_REPLY_EMAIL,
      to: "pradyuman212@gmail.com",
      subject: "📩 New Contact Message",
      text: `👤 Name: ${name}\n💬 Message: ${message}`,
    });

    // 📧 Autoresponder to user
    if (email) {
      await resend.emails.send({
        from: AUTO_REPLY_EMAIL,
        to: email,
        subject: "✅ We Got Your Message!",
        text: `Hi ${name},\n\nThanks for reaching out to NoteEase!\nYour message has been received — we’ll get back to you soon.\n\nBest,\nTeam NoteEase 🧠`,
      });
    }

    res.json({ success: true, message: "Message submitted successfully!" });
  } catch (err) {
    console.error("❌ Contact error:", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// ✅ WRITER FORM
app.post("/api/writer", upload.single("writing_sample"), async (req, res) => {
  try {
    const { name, phone, education, motivation, email } = req.body;
    const writing_sample = req.file ? req.file.filename : "No file uploaded";

    if (!name || !phone || !education || !motivation)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });

    await db.query(
      "INSERT INTO writer_applications (name, phone, education, writing_sample, motivation) VALUES (?, ?, ?, ?, ?)",
      [name, phone, education, writing_sample, motivation]
    );

    // 🔔 Notify admin
    await resend.emails.send({
      from: AUTO_REPLY_EMAIL,
      to: "pradyuman212@gmail.com",
      subject: "📝 New Writer Application",
      text: `👤 Name: ${name}\n📞 Phone: ${phone}\n🎓 Education: ${education}\n💭 Motivation: ${motivation}`,
    });

    // 📧 Autoresponder
    if (email) {
      await resend.emails.send({
        from: AUTO_REPLY_EMAIL,
        to: email,
        subject: "🧠 Thanks for Applying as a Writer!",
        text: `Hi ${name},\n\nWe’ve received your writer application and will review it shortly.\nOur team will reach out if your profile matches our needs.\n\nBest,\nTeam NoteEase ✍️`,
      });
    }

    res.json({ success: true, message: "Application submitted successfully!" });
  } catch (err) {
    console.error("❌ Writer error:", err);
    res.status(500).json({ success: false, error: "Server error." });
  }
});

// ✅ REQUEST FORM
app.post("/api/request", async (req, res) => {
  try {
    const { name, phone, address, message, email } = req.body;
    if (!name || !phone || !address || !message)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });

    await db.query(
      "INSERT INTO generic_requests (name, phone, address, message) VALUES (?, ?, ?, ?)",
      [name, phone, address, message]
    );

    // 🔔 Admin notification
    await resend.emails.send({
      from: AUTO_REPLY_EMAIL,
      to: "pradyuman212@gmail.com",
      subject: "📦 New NoteEase Request",
      text: `👤 Name: ${name}\n📞 Phone: ${phone}\n🏠 Address: ${address}\n💬 Message: ${message}`,
    });

    // 📧 Autoresponder
    if (email) {
      await resend.emails.send({
        from: AUTO_REPLY_EMAIL,
        to: email,
        subject: "✅ Your NoteEase Request Was Received!",
        text: `Hi ${name},\n\nThank you for reaching out to NoteEase!\nWe’ve received your request and our team will get back to you soon.\n\nBest,\nTeam NoteEase 📚`,
      });
    }

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
