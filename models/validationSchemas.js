/**
 * middle ware for validating that incoming information meets requirements on the server side
 * client side validation is currently located in boilerplate
 * NOT DEPENDANT ON MONGOOSE SCHEMA'S BUT STORED WITH THEM AS LOGICAL ASSOCIATION
 * 
 */

const Joi = require('joi');

module.exports.hauntingSchema = Joi.object({
    haunting: Joi.object({
        title: Joi.string().required(),
        price: Joi.optional(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});