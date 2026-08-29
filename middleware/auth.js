const jwt = require("jsonwebtoken");

const AppError = require("../utils/AppError");

const protect = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return next(
            new AppError("Authentication required", 401)
        );
    }

    const parts = authHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer"
    ) {
        return next(
            new AppError("Invalid authorization format", 401)
        );
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();
    } catch (error) {
        next(
            new AppError("Invalid or expired token", 401)
        );
    }
};

module.exports = protect;