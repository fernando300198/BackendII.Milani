const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.signedCookies.currentUser;
    if (!token) {
        return req.originalUrl.startsWith("/api/")
            ? res.status(401).json({ message: "Acceso denegado. No hay token." })
            : res.redirect("/users/login");
    }

    try {
        const decoded = jwt.verify(token, "secretKey");
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie("currentUser");

        return req.originalUrl.startsWith("/api/")
            ? res.status(401).json({ message: "Token inválido o expirado." })
            : res.redirect("/users/login");
    }
};

module.exports = authMiddleware;
