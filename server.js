import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- DATABASE ---------------- */

connectDB();

/* ---------------- HOME ROUTE ---------------- */

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

/* ---------------- REGISTER ---------------- */

app.post("/api/register", async (req, res) => {
  try {
    console.log("🔥 REGISTER HIT");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.json({
      message: "User registered successfully",
      user,
    });

  } catch (error) {
    console.log("🔥 REGISTER ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

/* ---------------- LOGIN ---------------- */

app.post("/api/login", async (req, res) => {
  try {
    console.log("🔥 LOGIN HIT");

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id },
      "secretkey123",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user,
    });

  } catch (error) {
    console.log("🔥 LOGIN ERROR:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
});

/* ---------------- COURSES ---------------- */

app.get("/api/courses", (req, res) => {
  res.json([
    {
      id: 1,
      slug: "digilocker",
      name: "DigiLocker Training",
      description: "Document upload, verification, digital certificates",
      benefits: [
        "Paperless documents",
        "Secure storage",
        "Government verified data"
      ],
      steps: [
        "Create DigiLocker account",
        "Link Aadhaar",
        "Upload documents",
        "Verify documents"
      ]
    },
    {
      id: 2,
      slug: "aadhaar",
      name: "Aadhaar Services",
      description: "Update, e-KYC, biometric authentication",
      benefits: [
        "Identity verification",
        "Government services access",
        "Secure authentication"
      ],
      steps: [
        "Visit Aadhaar portal",
        "Login with OTP",
        "Update details",
        "Download e-Aadhaar"
      ]
    },
    {
      id: 3,
      slug: "pan",
      name: "PAN Services",
      description: "PAN application, correction, linking",
      benefits: [
        "Tax filing",
        "Financial access",
        "Bank verification"
      ],
      steps: [
        "Apply on NSDL",
        "Submit documents",
        "Verify OTP",
        "Download e-PAN"
      ]
    }
  ]);
});

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});