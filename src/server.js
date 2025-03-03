const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productsRoutes = require("./routes/productsRoutes");

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// rutas
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando...");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
