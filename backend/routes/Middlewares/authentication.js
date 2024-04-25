const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const z = require("zod");

const AuthSchema = z.string().regex(/^Bearer .+$/, { message: "Invalid authorization key." });
function authMiddleware(req, res, next){
    const auth = req.headers.authorization;
    if (!auth){
        return res.status(401).json({
            error: "Unauthorized",
            message: "Access Token is missing",
            success: false
        })
    }

    const authValidation = AuthSchema.safeParse(auth);
    if (!authValidation.success){
        const error = authValidation.error.issues[0];
        return res.status(400).json({
            error: "Bad request",
            message: error.message,
            success: false
        })
    };
    
    const token = auth.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.userId){
            req.userId = decoded.userId;
            next();
        } else {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Invalid Access token supplied",
                success: false
            })
        }
    } catch(error){
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
            success: false
        })
    }
}

module.exports = authMiddleware