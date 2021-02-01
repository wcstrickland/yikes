/**
 * middle ware for validating that incoming information meets requirements on the server side
 * client side validation is currently located in boilerplate
 * NOT DEPENDANT ON MONGOOSE SCHEMA'S BUT STORED WITH THEM AS LOGICAL ASSOCIATION
 * 
 */

const Joi = require('joi');
const AppError = require('../utilities/AppError');

const validateCampground = (req, res, next) => {
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    });
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(',');
        throw new AppError(msg, 400);
    } else {
        next();
    }
};

module.exports = validateCampground;