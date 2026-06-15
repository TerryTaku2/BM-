const jwt = require("jsonwebtoken");

// Protect HTML page routes — redirect to login on failure
const protect = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.redirect("/login");
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.clearCookie("token");
        res.redirect("/login");
    }
};

// Protect API routes — return 401 JSON on failure
const protectAPI = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};

// Role-based guard for HTML page routes
const requireRole = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.redirect("/login");
    next();
};

module.exports = { protect, protectAPI, requireRole };
