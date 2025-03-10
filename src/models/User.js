const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true }, // Nuevo campo
  password: { type: String, required: true },
  cart: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" }, // Referencia a Carts
  role: { type: String, enum: ["usuario", "admin"], default: "usuario" },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
