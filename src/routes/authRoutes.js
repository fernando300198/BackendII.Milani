const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// registro de usuario
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // verificar si usuario existe
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "El usuario ya existe" });

    // hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    // asignar rol automáticamente
    const role = email === "adminCoder@coder.com" ? "admin" : "usuario";

    // new user
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar usuario", error });
  }
});

// user login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // verificar if user exist
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    // generar token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token, user });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error });
  }
});

module.exports = router;