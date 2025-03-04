const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const productsRoutes = require("./routes/productsRoutes");

// load variables de entorno
dotenv.config();

// conectar base ded datos
connectDB();

// start app
const app = express();
const PORT = process.env.PORT || 3000;

// middleware json
app.use(express.json());

// config sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto",
    resave: false,
    saveUninitialized: false,
  })
);

// passport
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);

// ruta principal
app.get("/", (req, res) => res.send("Servidor funcionando..."));

// start server
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
