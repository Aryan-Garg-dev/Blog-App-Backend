const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const { PREFERENCES } = require("./constants")
require('dotenv').config()

mongoose.connect(process.env.DB_HOST);

/**
 * User ( username, firstname, lastname, email, password, blog-preferences )
 */
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
        maxLength: [30, "username must be 30 characters or fewer"],
        trim: true,
        unique: true
    },
    name: {
        first: {
            type: String,
            required: [true, "first-name is required"],
            trim: true,
            maxLength: [50, "first-name must be 50 characters or fewer"],
        },
        last: {
            type: String,
            required: [true, "last-name is required"],
            trim: true,
            maxLength:[50, "first-name must be 50 or fewer characters"],
        }
    },
    password: {
        type: String,
        required: true,
        minLength: [6, "password must be 6 or more characters"],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, "email-ID is required"],
        validate: {
            validator: email => {
              return /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/.test(email);
            },
            message: props => `${props.value} is not a valid email address!`
        },
        trim: true,
        minLength: [6, "email-ID must be 6 or more characters"],
        maxLength: [30, "email-ID can not have more than 30 characters"], 
    },
    preferences: [{
        type: String,
        enum: PREFERENCES,
    }]
});

/* Hashing password for protection against potential attacks using hashing
and Salting is primarily done to prevent hash generate from same passwords from being same */
userSchema.methods.createHash = async function (plainTextPassword){
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return await bcrypt.hash(plainTextPassword, salt);
}

/* Compares and validate password entered (candidates password) and password stored (this.password) */ 
userSchema.methods.validatePassword = async function (candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Blog { author, title, body, likes(count, users), comments(userId, message), authored date, tags }
 */

const blogSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    title: {
        type: String,
        required: [true, "Blog must have a title"],
        trim: true,
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    likes: {
        count: {
            type: Number,
            default: ()=>(
                this.users ? this.users.length : 0
            ),
        },
        users: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        }]
    },
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
        }, 
        message: {
            type: String,
            trim: true,
        }
    }],
    authoredDate: {
        type: Date,
        default: Date.now,
        required: true,
    },
    tags: [{
        type: String,
        enum: PREFERENCES,
    }]
})

const Users = mongoose.model("Users", userSchema);
const Blogs = mongoose.model("Blogs", blogSchema);

module.exports = {
    Users, Blogs
}