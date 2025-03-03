const roleMiddleware = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({ message: "Acceso denegado: No tienes permisos" });
  }
  next();
};

module.exports = roleMiddleware;
