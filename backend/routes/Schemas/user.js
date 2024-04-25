const z = require("zod");
const { PREFERENCES } = require('../../constants');

/**
 * User
 * { signup, login, update, ... }
 */

//Signup
const userSignUpSchema = z.object({
    username: z.string()
        .min(1, { message: "username cannot be empty" })
        .max(30, { message: "username can be more than 30 characters long " })
        .trim().toLowerCase(),
    name: z.object({
        first: z.string()
            .min(1, { message: "first-name cannot be empty" })
            .max(50, { message: "first-name cannot have more than 50 characters." })
            .trim(),
        last: z.string()
            .min(1, { message: "last-name cannot be empty" })
            .max(50, { message: "last-name cannot have more than 50 characters." })
            .trim(),
    }),
    password: z.string()
        .min(6, { message: "Password must be 6 or more characters long" })
        .trim(),
    email: z.string()
        .email({ message: "Invalid email address" })
        .trim().toLowerCase(),
    preferences: z.array(z.enum(PREFERENCES))
        .min(3, { message: "Atleast 3 preferences must be selected" })
        .refine(
            preferences=>preferences.every(preference=>PREFERENCES.includes(preference)),
            { message: 'Preferences must be one of the following: ' + PREFERENCES.join(', ') }
        )
}).required();

//Login
const userLoginSchema = z.object({
    email: z.string()
        .email({ message: "Invalid email address" })
        .trim().toLowerCase(),
    password: z.string()
    .min(6, { message: "Password must be 6 or more characters long" })
    .trim(), 
}).required();


//Update
const userUpdateSchema = z.object({
    username: z.string()
        .min(1, { message: "username cannot be empty" })
        .max(30, { message: "username can be more than 30 characters long " })
        .trim().toLowerCase().optional(),
    name: z.object({
        first: z.string()
            .min(1, { message: "first-name cannot be empty" })
            .max(50, { message: "first-name cannot have more than 50 characters." })
            .trim().optional(),
        last: z.string()
            .min(1, { message: "last-name cannot be empty" })
            .max(50, { message: "last-name cannot have more than 50 characters." })
            .trim().optional(),
    }).optional(),
    email: z.string()
        .email({ message: "Invalid email address" })
        .trim().toLowerCase().optional(),
    preferences: z.array(z.enum(PREFERENCES))
        .min(3, { message: "Atleast 3 preferences must be selected" })
        .refine(
            preferences=>preferences.every(preference=>PREFERENCES.includes(preference)),
            { message: 'Preferences must be one of the following: ' + PREFERENCES.join(', ') }
        )
})

const userFilterSchema = z.string()
    .max(50, { message: "Filter must be 50 or fewer characters long" })
    .trim();


module.exports = {
    userSignUpSchema,
    userLoginSchema,
    userUpdateSchema,
    userFilterSchema
}



