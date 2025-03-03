const express = require("express");
const Product = require("../models/Product");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

// todos los productos (solo usuarios logeados)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
});

// crear un producto (solo admin)
router.post("/", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { name, price } = req.body;
    const newProduct = new Product({ name, price });
    await newProduct.save();
    res.status(201).json({ message: "Producto creado con éxito", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al crear producto", error });
  }
});

// eliminar un producto (solo admins)
router.delete("/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.json({ message: "Producto eliminado con éxito" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error });
  }
});

module.exports = router;
