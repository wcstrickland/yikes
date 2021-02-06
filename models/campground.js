/**
 * create a model for `campground` object in js
 * first define the schema
 * then export it as a mongoose.model Capitalized singular(mongo will pluralize), 
 * mongoose.model takes the string name of the model and the schema you define as arguments
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

module.exports = mongoose.model('Campground', CampgroundSchema);