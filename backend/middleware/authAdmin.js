import jwt from "jsonwebtoken";
import { CITIZEN_KEY, OFFICER_KEY, ADMIN_KEY } from "../config.js";

const verifyCitizenToken = async (req, res, next) => {
    let token = req.header("auth-token");
    if (!token) {
        return res.json({
            success: false,
            message: "Please authenticate using valid token",
        });
    }
    try{
        const decoded = jwt.verify(token, CITIZEN_KEY);
        // attach decoded payload to req so controllers can use it
        req.citizen = decoded;
        return next();
    }
    catch (error){
        return res.json({
            success:false,
            message:"Invalid or expired token"
        });
    }
};

const verifyOfficerToken = async (req, res, next) => {
    let token = req.header("auth-token");
    if (!token) {
        return res.json({
            success: false,
            message: "Please authenticate using valid token",
        });
    }
    try{
        const decoded = jwt.verify(token, OFFICER_KEY);
        // attach decoded payload to req so controllers can use it
        req.officer = decoded;
        return next();
    }
    catch (error){
        return res.json({
            success:false,
            message:"Invalid or expired token"
        });
    }
};

const verifyAdminToken = async (req, res, next) => {
    let token = req.header("auth-token");
    if (!token) {
        return res.json({
            success: false,
            message: "Please authenticate using valid token",
        });
    }
    try {
        const decoded = jwt.verify(token, ADMIN_KEY);
        req.admin = decoded;
        return next();
    } catch (error) {
        return res.json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

// Default export for backward compatibility
export default verifyCitizenToken;
export { verifyCitizenToken, verifyOfficerToken, verifyAdminToken };

