import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendVerificationEmail } from "../utils/sendMail.js";

const router = express.Router();
const signupCooldown = {};

router.post("/signup", async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  const now = Date.now();
  if (signupCooldown[email] && now - signupCooldown[email] < 15000) {
  return res.sendStatus(429); 
}

  signupCooldown[email] = now;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const token = jwt.sign(
    { email, username, password: hashedPassword },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  await sendVerificationEmail(email, token);
  return res.json({
    message: "Verification email sent. Please check your inbox.",
  });
});



router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

   
    if (!user.verified) {
      return res.status(400).json({ 
        message: "Please verify your email before logging in. Check your inbox." 
      });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

  
      const accessToken = jwt.sign(
      { username: user.username, email: user.email },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }   
    );

    const refreshToken = jwt.sign(
      { username: user.username, email: user.email },
      process.env.REFRESH_SECRET,
      { expiresIn: "7d" }   
    );


    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, 
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: "Login successful",
      accessToken,
      username: user.username,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, username, password } = decoded;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.send("Email already verified. You can log in now.");
    }
    await User.create({
      email,
      username,
      password,
      verified: true,
    });

    return res.send("Email verified");
  } catch (error) {
    console.error(error);
    return res.status(400).send("Invalid or expired verification link.");
  }
});



router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { username: decoded.username, email: decoded.email },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

router.get("/validate", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    res.sendStatus(200);
  });
});

export default router;
