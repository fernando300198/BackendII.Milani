const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Cart = require("../models/Cart");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// login view
router.get("/login", (req, res) => {
    res.render("login", { error: req.query.error });
});

// info usuario autenticado
router.get("/current", authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Usuario autenticado",
        user: {
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            email: req.user.email,
            role: req.user.role
        }
    });
});

// registro de user
router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password, age } = req.body;

    try {
        // verif si el usuario existe
        if (await User.findOne({ email })) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        // encriptar password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // crear carrito vacio para usuario
        const newCart = await new Cart({}).save();

        // determinar rol de usuario
        const role = email === "adminCoder@coder.com" ? "admin" : "usuario";

        // crear usuario con carrito asignado
        const newUser = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            age,
            cart: newCart._id,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "Usuario registrado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

// login jwt
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Credenciales incorrectas" });
        }

        // token jwt
        const token = jwt.sign(
            { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
            "secretKey",
            { expiresIn: "1h" }
        );

        // save cookie token jwt
        res.cookie("currentUser", token, { httpOnly: true, signed: true });

        res.json({
            success: true,
            message: "Inicio de sesión exitoso",
            token,
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    res.clearCookie("currentUser");
    res.json({ success: true, message: "Sesión cerrada correctamente" });
});

module.exports = router;
