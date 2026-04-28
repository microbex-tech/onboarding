import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.get("/", (req, res) => {
  res.send("Microbex Onboarding API is running");
});

app.post("/api/email", async (req, res) => {
  const { email, source = "website" } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  try {
    console.log('Attempting to insert email:', email, 'source:', source);
    const result = await pool.query(
      `INSERT INTO onboarding.email_leads (email, source, status)
       VALUES ($1, $2, $3)
       RETURNING id, email, source, status, created_at`,
      [email, source, 'active']
    );
    console.log('Insert successful:', result.rows[0]);

    res.status(200).json({
      success: true,
      message: "Email submitted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Database error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);

    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});