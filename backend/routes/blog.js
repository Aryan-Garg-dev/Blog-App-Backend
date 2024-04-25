const { Router } = require("express");
const { blogCreateSchema, blogUpdateSchema, blogFilterSchema, blogCommentSchema } = require("./Schemas/blog");
const authMiddleware = require("./Middlewares/authentication");
const { Blogs, Users } = require("../db");
const router = Router();

router.use(authMiddleware);

/**
 ** Endpoints
 * { create, get (user's blogs), update, delete, get-all, get (filter), get (A/C to users preferences), like, comment }
 */

/**
 * * Create Blog
 * [!] Request Validation
 * [!] If blog with same title exist
 * [!] Saving blog in db
 */ 
router.post("/create", async(req, res)=>{
    const request = req.body;
    const userId = req.userId;
    const requestValidation = blogCreateSchema.safeParse(request);
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
        const blogWithSameTitle = await Blogs.findOne({ title: request.title });
        if (blogWithSameTitle){
            return res.status(409).json({
                error: "Conflict",
                message: "Blog with same title exits",
                success: false
            })
        }

        const createdBlog = await Blogs.create({...request,  author: userId });
        return res.status(200).json({
            message: "Blog created successfully",
            blogId: createdBlog._id,
            success: true
        })
    } catch(error){
        return res.status(500).json({ 
            error: "Internal Server Error",
            message: error.message,
            success: false 
        });
    }
})

/**
 * Update Blog
 */

router.put("/update/:id", async(req, res)=>{
    const blogId = req.params.id;
    const request = req.body;
    const requestValidation = blogUpdateSchema.safeParse(request);
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
        await Blogs.updateOne({ _id: blogId }, request)
        return res.status(200).json({
            message: "Blog updated successfully",
            success: true,
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
 * Delete Blog
 */

router.delete("/delete/:id", async(req, res)=>{
    const blogId = req.params.id;
    try {
        await Blogs.deleteOne({ _id : blogId });
        return res.status(200).json({
            message: "Blog deleted successfully",
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
 ** Get Blogs 
 * ($) Blogs written by user ( either all or filtered )( title, tags )
 * ($) Blogs fetched by filter or all blogs
 * ($) Blogs a/c to user's prefernces
 */

 // Blogs written by user
router.get("/", async (req, res)=>{
    const userId = req.userId;
    const filter = req.query.filter || "";
    const requestValidation = blogFilterSchema.safeParse(filter);
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
        const userBlogs = await Blogs.find({
            author: userId,
            "$or": [
                { title: { "$regex": filter, "$options": "i" } },
                { tags: { $elemMatch: { $regex: filter, $options: "i" } } },
            ]
        })
        return res.status(200).json({
            blogs: userBlogs,
            message: "fetched all the users' blogs successfully",
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

// Get all blogs or filtered ones
router.get("/all", async(req, res)=>{
    const userId = req.userId;
    const filter = req.query.filter || "";
    const requestValidation = blogFilterSchema.safeParse(filter);
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
        const allBlogs = await Blogs.find({
            "$or": [
                { title: { "$regex": filter, "$options": "i" } },
                { tags: { "$elemMatch" : { "$regex": "filter", $options: "i" } } },
            ]
        })
        return res.status(200).json({
            blogs: allBlogs,
            message: "fetched all the blogs successfully",
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

router.get("/recommended", async (req, res)=>{
    const userId = req.userId;
    try {
        const user = await Users.find({ _id: userId });
        const preferences = user[0].preferences;

        const recommendedBlogs = await Blogs.find({
            tags: { "$elemMatch": { "$in": preferences } }
        })

        return res.status(200).json({
            blogs: recommendedBlogs,
            message: "fetched all the recommended blogs successfully",
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
 * Like, comment (add, remove)
 */

router.put("/like/:id", async (req, res)=>{
    const userId = req.userId;
    const id = req.params.id;
    try {
        //if users has liked it, then unike it
        // if not liked then like it
        const blog = await Blogs.findOne({ _id: id });
        const likedIndex = blog.likes.users.indexOf(userId);
        if (likedIndex != -1){
            blog.likes.users.splice(likedIndex, 1);
            blogs.likes.count--;
        } else {
            blogs.likes.users.push(userId);
            blog.likes.count++;
        }

        await blog.save();

        return res.status(200).json({
            success: true,
            message: "Like toggled successfully",
            liked: likedIndex == -1 ? true : false, 
        })

    } catch(error){
        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            success: false
        })
    }
})

router.put("/comment/:id", async(req, res)=>{
    const userId = req.userId;
    const id = req.params.id
    const comment = req.body.comment;
    const requestValidation = blogCommentSchema.safeParse(comment);
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
        await Blogs.updateOne({_id: id}, {
            comments: {
                "$push": {
                    comments: {
                        user: userId,
                        message: comment
                    }
                }
            }
        });
        return res.status(200).json({
            success: true,
            message: "Comment added successfully",
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