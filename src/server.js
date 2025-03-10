const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const passport = require("passport");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const exphbs = require("express-handlebars");
const authRoutes = require("./routes/authRoutes");
const productsRoutes = require("./routes/productsRoutes");

// load variables de entorno
dotenv.config();

// conectar base de datos
connectDB();

// start app
const app = express();
const PORT = process.env.PORT || 3000;

// middleware json & url encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// config de sesiones
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secreto",
    resave: false,
    saveUninitialized: false,
  })
);

// config cookies jwt
app.use(cookieParser(process.env.COOKIE_SECRET || "cookieSecreta"));

// config passport
require("./config/passport");
app.use(passport.initialize());
app.use(passport.session());

// config handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", "./src/views");

// rutas
app.use("/api/users", authRoutes);
app.use("/api/products", productsRoutes);

// ruta principal
app.get("/", (req, res) => res.send("Servidor funcionando correctamente..."));

// iniciar servidor
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
