const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.signedCookies.currentUser;
    if (!token) return res.redirect("/users/login");

    try {
        const decoded = jwt.verify(token, "secretKey");
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie("currentUser");
        return res.redirect("/users/login");
    }
};

module.exports = authMiddleware;
