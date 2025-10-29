// ✅ NoteEase Backend - Clean Production Version (For Railway)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// -------------------------
// ✅ CORS Setup (Frontend URL)
// -------------------------
app.use(
  cors({
    origin: ["https://pradyumanmishra20.github.io"], // your frontend site
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// -------------------------
// ✅ Static Files (optional)
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// -------------------------
// ✅ MySQL Connection (using .env vars)
// -------------------------
let db;
const initDB = async () => {
  try {
    db = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      ssl: { rejectUnauthorized: false },
    });
    console.log("✅ MySQL connected successfully!");
  } catch (err) {
    console.error("❌ Database connection error:", err);
  }
};
await initDB();

// -------------------------
// ✅ Email Setup (Nodemailer)
// -------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendAdminEmail(subject, message) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject,
      html: message,
    });
    console.log("📩 Admin email sent!");
  } catch (err) {
    console.error("❌ Email error:", err);
  }
}

// -------------------------
// ✅ Routes
// -------------------------

// 💬 Contact Form
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const sql = `INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)`;
    await db.execute(sql, [name, email, message]);

    await sendAdminEmail(
      "📩 New Contact Message - NoteEase",
      `
      <h2>New Contact Message</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b> ${message}</p>
      `
    );

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✍️ Writer Application
app.post("/api/writer-application", async (req, res) => {
  const { name, email, experience, subject, sample_link } = req.body;
  if (!name || !email || !experience || !subject)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const sql = `INSERT INTO writer_applications (name, email, experience, subject, sample_link)
                 VALUES (?, ?, ?, ?, ?)`;
    await db.execute(sql, [name, email, experience, subject, sample_link || ""]);

    await sendAdminEmail(
      "🧠 New Writer Application - NoteEase",
      `
      <h2>New Writer Application</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Experience:</b> ${experience}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Sample Link:</b> ${sample_link || "N/A"}</p>
      `
    );

    res.json({ success: true, message: "Application submitted successfully!" });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🧾 Generic Request
app.post("/api/generic-request", async (req, res) => {
  const { name, email, topic, description } = req.body;
  if (!name || !email || !topic)
    return res.status(400).json({ error: "Missing required fields" });

  try {
    const sql = `INSERT INTO generic_requests (name, email, topic, description)
                 VALUES (?, ?, ?, ?)`;
    await db.execute(sql, [name, email, topic, description || ""]);

    await sendAdminEmail(
      "📝 New Generic Request - NoteEase",
      `
      <h2>New Generic Request</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Topic:</b> ${topic}</p>
      <p><b>Description:</b> ${description || "N/A"}</p>
      `
    );

    res.json({ success: true, message: "Request submitted successfully!" });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔐 Admin Login
app.post("/api/admin-login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    res.json({ success: true, message: "Login successful!" });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// -------------------------
// ✅ Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
