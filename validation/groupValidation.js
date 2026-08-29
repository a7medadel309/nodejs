const Joi = require("joi");

const createGroupSchema = Joi.object({
    name: Joi.string()
        .min(3)
        .max(50)
        .required(),

    canPost: Joi.boolean()
});

module.exports = {
    createGroupSchema
};