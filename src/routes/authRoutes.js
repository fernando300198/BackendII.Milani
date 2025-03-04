const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// registro con passport
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === "adminCoder@coder.com" ? "admin" : "usuario";
    
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
    await newUser.save();
    
    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

// login con passport
router.post("/login", passport.authenticate("local", { session: false }), (req, res) => {
  const user = req.user;
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ message: "Login exitoso", token, user });
});

// autenticar con github
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", passport.authenticate("github", { session: false, failureRedirect: "/login" }), (req, res) => {
  const user = req.user;
  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.redirect(`/api/products?token=${token}`);
});

module.exports = router;
