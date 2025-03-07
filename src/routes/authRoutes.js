const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// middleware async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// registro con passport
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    // verif si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "El usuario ya existe" });

    // hashear password
    const hashedPassword = await bcrypt.hash(password, 10);
    const role = email === "adminCoder@coder.com" ? "admin" : "usuario";

    // crear y guardar el usuario
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "Usuario registrado exitosamente" });
  })
);

// login con passport y sesiones
router.post(
  "/login",
  passport.authenticate("login"),
  (req, res) => {
    res.json({ message: "Login exitoso", user: req.user });
  }
);

// logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    res.json({ message: "Logout exitoso" });
  });
});

// autenticacion con github
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/api/products");
  }
);

module.exports = router;
