const express = require("express"); 
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// login page
router.get("/login", (req, res) => {
    res.render("login", { error: req.query.error });
});

// login page user (view)
router.get("/current", authMiddleware, (req, res) => {
    res.render("current", { user: req.user });
});

// registro de usuario API
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "El usuario ya existe" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const role = email === "adminCoder@coder.com" ? "admin" : "usuario";

        const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

// user login jwt
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.redirect("/api/users/login?error=1");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.redirect("/api/users/login?error=1");

        const token = jwt.sign(
            { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
            "secretKey",
            { expiresIn: "1h" }
        );

        res.cookie("currentUser", token, { httpOnly: true, signed: true });
        res.redirect("/api/users/current");
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

// logout cookie jwt
router.get("/logout", (req, res) => {
    res.clearCookie("currentUser");
    res.redirect("/api/users/login");
});

module.exports = router;
