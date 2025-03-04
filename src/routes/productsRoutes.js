const express = require("express");
const Product = require("../models/Product");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

// obtener productos (usuarios autenticados)
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

// crear un nuevo producto (solo admin)
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
