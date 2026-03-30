import jwt from "jsonwebtoken";
import { CITIZEN_KEY, OFFICER_KEY, ADMIN_KEY } from "../config.js";

const verifyCitizenToken = async (req, res, next) => {
    let token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing. Please log in.",
        });
    }
    try {
        const decoded = jwt.verify(token, CITIZEN_KEY);
        req.citizen = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token has expired. Please log in again." : "Invalid token. Please log in.",
        });
    }
};

const verifyOfficerToken = async (req, res, next) => {
    let token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing. Please log in.",
        });
    }
    try {
        const decoded = jwt.verify(token, OFFICER_KEY);
        req.officer = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token has expired. Please log in again." : "Invalid token. Please log in.",
        });
    }
};

const verifyAdminToken = async (req, res, next) => {
    let token = req.header("auth-token");
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is missing. Please log in.",
        });
    }
    try {
        const decoded = jwt.verify(token, ADMIN_KEY);
        if (!decoded.role || decoded.role.toLowerCase() !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }
        req.admin = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError" ? "Token has expired. Please log in again." : "Invalid token. Please log in.",
        });
    }
};

// Default export for backward compatibility
export default verifyCitizenToken;
export { verifyCitizenToken, verifyOfficerToken, verifyAdminToken };

