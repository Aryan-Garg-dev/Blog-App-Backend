const z = require("zod");
const { PREFERENCES } = require('../../constants');

/**
 * Blog Schema ( create, update, filter )
 */

//Create (title, body, tags)
const blogCreateSchema = z.object({
    title: z.string()
        .min(1, { message: "blog title can not be empty" })
        .trim(),
    body: z.string()
        .min(1, { message: "blog body can not be empty" })
        .trim(),
    tags: z.array(z.enum(PREFERENCES))
        .refine(
            preferences=>preferences.every(preference=>PREFERENCES.includes(preference)),
            { message: 'Preferences must be one of the following: ' + PREFERENCES.join(', ') }
        )
}).required();

//Update
const blogUpdateSchema = z.object({
    title: z.string()
        .min(1, { message: "blog title can not be empty" })
        .trim().optional(),
    body: z.string()
        .min(1, { message: "blog body can not be empty" })
        .trim().optional(),
    tags: z.array(z.enum(PREFERENCES))
    .refine(
        preferences=>preferences.every(preference=>PREFERENCES.includes(preference)),
        { message: 'Preferences must be one of the following: ' + PREFERENCES.join(', ') }
    ).optional()
});

//Filter 
const blogFilterSchema = z.string()
    .max(50, { message: "Filter must be 50 or fewer characters long" })
    .trim();

module.exports = {
    blogCreateSchema, 
    blogUpdateSchema, 
    blogFilterSchema
}


