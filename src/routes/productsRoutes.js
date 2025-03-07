const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

// middleware login
const authMiddleware = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(403).json({ message: "Acceso denegado. No hay sesión activa" });
    }
    next();
};

// middleware para roles
const roleMiddleware = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Acceso denegado. Permisos insuficientes" });
    }
    next();
};

// get productos
router.get("/", authMiddleware, async (req, res) => {
    try {
        const products = await Product.find();
        res.json({
            message: `Bienvenido, ${req.user.email}`,
            role: req.user.role,
            products
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

// neuvo productos (solo admin)
router.post("/", authMiddleware, roleMiddleware(["admin"]), async (req, res) => {
    try {
        const { name, price } = req.body;
        const newProduct = new Product({ name, price });
        await newProduct.save();
        res.status(201).json({ message: "Producto creado con éxito", product: newProduct });
    } catch (error) {
        res.status(500).json({ message: "Error al crear producto", error });
    }
});

module.exports = router;

