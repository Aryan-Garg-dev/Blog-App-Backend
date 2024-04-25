const { Router } = require("express");
const router = Router();
const { Users } = require('../db');
const jwt = require('jsonwebtoken');
const { userSignUpSchema, userLoginSchema, userUpdateSchema, userFilterSchema } = require('./Schemas/user');
const authMiddleware = require("./Middlewares/authentication");
const { PREFERENCES } = require("../constants");

require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

/**
 ** Endpoints
 *  Signup User: L-21,
 *  Login User: L-82,
 *  Update User-Info: L-138,
 *  Delete User: L-177,
 *  Get All-Users (filter): L-199,
 *  Get User-Details: L-252,
 */

/** 
 ** Signup
 * [!] Request Validation
 * [!] Check if user already exists
 * [!] Saving user in db and returning access_token (jwt with _id) 
 */

router.post("/signup", async(req, res)=>{
    const request = req.body;
    const requestValidation = userSignUpSchema.safeParse(request);
    if (!requestValidation.success){
        const error = requestValidation.error.issues[0];
        return res.status(400).json({ 
            path: error.path.length > 1 
                ? error.path.reverse().join("-")
                : error.path[0],
            error: "Bad Request", 
            message: error.message,
            success: false
        })
    }
    
    try {
        const userAlreadyExists = await Users.findOne({ 
            "$or" : [
                { username: request.username },
                { email: request.email }
            ]
        })
        if (userAlreadyExists){
            return res.status(409).json({
                error: `${
                    userAlreadyExists.username == request.username
                    ? "This username is already taken"
                    : "This email address already exists"
                }`,
                message: "User already exists",
                success: false
            })
        }

        const createdUser = new Users(request);
        const hashedPassword = await createdUser.createHash(request.password);
        createdUser.password = hashedPassword;
        await createdUser.save();
        
        const token = jwt.sign({ userId: createdUser._id }, JWT_SECRET);
        return res.status(200).json({ 
            token, 
            message: "User created successfully", 
            success: true 
        })
    } catch (error){
        return res.status(500).json({ 
            error: "Internal Server Error",
            message: error.message,
            success: false 
        });
    }
})

/**
 ** Login
 * [!] Request Validation
 * [!] Check if user actually exists
 * [!] getting userId and returning access_token
 */

router.post("/login", async (req, res)=>{
    const request = req.body;
    const requestValidation = userLoginSchema.safeParse(request);
    if (!requestValidation.success){
        const error = requestValidation.error.issues[0];
        return res.status(400).json({ 
            path: error.path.length > 1 
                ? error.path.reverse().join("-")
                : error.path[0],
            error: "Bad Request", 
            message: error.message,
            success: false
        })
    }

    try {
        const user = await Users.findOne({ email: request.email });
        if (!user){
            return res.status(404).json({
                error: "User not found",
                message: "Incorrect email address",
                success: false
            });
        }

       const validatedPassword = await user.validatePassword(request.password); 
       if (validatedPassword){
            const token = jwt.sign({ userId: user._id }, JWT_SECRET);
            return res.status(200).json({ 
                token, 
                message: "User logged in successfully", 
                success: true 
            })
       } else {
            return res.status(401).json({
                error: "Unauthorized",
                message: "Incorrect password entered",
                success: false
            })
       }
    } catch (error){
        return res.status(500).json({ 
            error: error.message,
            message: "Error loggin in user",
            success: false 
        });
    }
})

/**
 ** Update Details
 * [!] User Authentication (authMiddleware)
 * [!] Request Validation 
 * [!] Info Update
 */

router.put("/update", authMiddleware, async(req, res)=>{
    const request = req.body;
    const userId = req.userId;

    const requestValidation = userUpdateSchema.safeParse(request);
    if (!requestValidation.success){
        const error = requestValidation.error.issues[0];
        return res.status(400).json({ 
            path: error.path.length > 1 
                ? error.path.reverse().join("-")
                : error.path[0],
            error: "Bad Request", 
            message: error.message,
            success: false
        })
    }

    try {
        await Users.updateOne({ _id: userId }, request)
        return res.status(200).json({
            message: "User-Info updated successfully",
            success: true
        })
    } catch(error){
        return res.status(500).json({
            error: "Internal server error",
            message: error.message,
            success: false
        })
    }
})

/**
 ** Delete Account
 */

router.delete("/delete", authMiddleware, async (req, res)=>{
    const userId = req.userId;
    try {
        await Users.deleteOne({ _id: userId });
        return res.status(200).json({
            message: "User deleted successfully",
            success: true
        })
    } catch(error){
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            success: false
        })
    }
})


/**
 ** Get All users (filtered)
 * i.e. Search for users or recieve all 
 * takes filter as query param
 */

router.get("/bulk", authMiddleware, async (req, res)=>{
    const filter = req.query.filter || "";
    const requestValidation = userFilterSchema.safeParse(filter);
    if (!requestValidation.success){
        const error = requestValidation.error.issues[0];
        return res.status(400).json({ 
            path: error.path.length > 1 
                ? error.path.reverse().join("-")
                : error.path[0],
            error: "Bad Request", 
            message: error.message,
            success: false
        }) 
    }

    try {
        const users = await Users.find({
            "$or": [
                { "username": { "$regex": filter, "$options": "i" } },
                { "name.first": { "$regex": filter, "$options": "i" } },
                { "name.last": { "$regex": filter, "$options": "i" } }
            ]
        })
        return res.status(200).json({
            users: users.map(user=>(
                {
                    username: user.username,
                    name: {
                        first: user.name.first,
                        last: user.name.last
                    },
                    email: user.email,
                    _id : user._id
                }
            )),
            success: true,
            message: "Users fetched successfully."
        })
    } catch(error){
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            success: false
        })
    }
})

/**
 ** User Details
 */

router.get("/details", authMiddleware, async(req, res)=>{
    const userId = req.userId;
    try {
        const user = await Users.findOne({ _id: userId });
        return res.status(200).json({
            user: {
                username: user.username,
                name: {
                    first: user.name.first,
                    last: user.name.last
                },
                email: user.email,
                preferences: user.preferences
            },
            message: "Users details fetched successfully",
            success: true
        })
    } catch(error){
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            success: false
        })
    }
})

module.exports = router;