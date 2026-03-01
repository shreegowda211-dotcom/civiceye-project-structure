import jwt from "jsonwebtoken";
import { CITIZEN_KEY } from "../config.js";
const JWT_SECRET = CITIZEN_KEY; // reuse same secret from config

const verifyAdminToken =  async (req, res, next)=> {
    let token = req.header("auth-token");
    if (!token) {
        return res.json({
            success: false,
            message: "Please authenticate using valid token",
        });
    }
    try{
        const decoded = jwt.verify(token, JWT_SECRET);
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


export default verifyAdminToken;

