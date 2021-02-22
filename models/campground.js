/**
 * create a model for `campground` object in js
 * first define the schema
 * then export it as a mongoose.model Capitalized singular(mongo will pluralize), 
 * mongoose.model takes the string name of the model and the schema you define as arguments
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const CampgroundSchema = new Schema({
    title: String,
    images: [{
        url: String,
        filename: String
    }],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

/**
 * mongoose middleware is broken up into document middle ware and quey middleware
 * this is a quey middle ware. It will run POST(after) every instance of `findOneAndDelete`
 * is called on CampgroundSchema. We will use this to create an on-delete cascade for the 
 * reviews stored in [] on campground. Even though this operation happens after deletion
 * the information about the deleted doc is passed to the call back function. we simply name it
 * in this case `deletedDoc`
 */

CampgroundSchema.post('findOneAndDelete', async function(deletedDoc) {
    if (deletedDoc) {
        await Review.deleteMany({
            _id: { $in: deletedDoc.reviews }
        });
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);