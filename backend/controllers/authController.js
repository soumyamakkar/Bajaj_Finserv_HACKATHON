const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redis = require("../config/redis");
const transporter = require("../config/email");
const crypto = require("crypto");

const JWT_SECRET="8837d446a420c34397e2a8b134adde75e90c152e09397e256ad5491ee5e9e9f5";

// Signup Controller
const signup = async (req, res) => {
  const { fullname, username, email, password, confirmPassword, gender } = req.body;

  // Check if the passwords match
  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({ fullname, username, email, password: hashedPassword, gender });
    await newUser.save();

    // Return user details (without password) and a success message
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullname,
      username: newUser.username,
      email: newUser.email,
      gender: newUser.gender,
    };

    res.status(201).json({
      msg: "User created successfully",
      user: userResponse,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


// Login Controller
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Extract fullname and avoid redeclaring email
    const { fullname, email: userEmail } = user;

    // Create JWT Token with user's full name and email
    const token = jwt.sign(
      { id: user._id, fullname, email: userEmail },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ msg: "Login successful", token, fullname, email: userEmail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};


const generate2FACode = async (req, res) => {
  try {
    const { email } = req.body; // User's email
    if (!email) return res.status(400).json({ error: "Email is required" });

    // Generate a 6-digit random code
    const code = crypto.randomInt(100000, 999999).toString();

    const redisResponse = await redis.setex(`2fa:${email}`, 300, code);
    console.log("Redis setex response:", redisResponse);

    console.log("Preparing email...");
    const mailOptions = {
      from: "soumya2401.be22@chitkara.edu.in",
      to: email,
      subject: "Your 2FA Code",
      text: `Your verification code is: ${code}. This code will expire in 5 minutes.`,
    };

    console.log("Sending email...");
    const emailResponse = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", emailResponse);
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "2FA code sent!" });
  } catch (emailError) {
    console.error("❌ Email sending failed:", emailError);
    return res.status(500).json({ error: "Email sending failed" });
  }
};

// Verify 2FA code
const verify2FACode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Retrieve stored code from Redis
    const storedCode = await redis.get(`2fa:${email}`);

    if (!storedCode) return res.status(400).json({ error: "Code expired or invalid" });
    if (storedCode !== code) return res.status(400).json({ error: "Invalid code" });

    // Success! Remove the code after verification
    await redis.del(`2fa:${email}`);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.fullname },
      "your-secret-key",
      { expiresIn: "1h" }
    );


    res.status(200).json({ message: "2FA verification successful!",token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { signup, login, generate2FACode, verify2FACode };
