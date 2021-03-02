/**
 * connect to mongo using mongoose
 * clear db
 * seed the db with random data pulled from cities.js and seedHelpers.js
 */

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Haunting = require('../models/haunting');
const Review = require('../models/review');

mongoose.connect('mongodb://localhost:27017/yikes', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async() => {
    await Haunting.deleteMany({});
    await Review.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const haunt = new Haunting({
            author: '6021ffe559b4264591643896',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [{
                    url: 'https://res.cloudinary.com/wcstrickland/image/upload/v1613498117/YelpCamp/twdxpdki20obcchmtifm.jpg',
                    filename: 'YelpCamp/twdxpdki20obcchmtifm'
                },
                {
                    url: 'https://res.cloudinary.com/wcstrickland/image/upload/v1613510053/YelpCamp/wzqwuxrlmswbciqi4sqa.jpg',
                    filename: 'YelpCamp/wzqwuxrlmswbciqi4sqa'
                }
            ],
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio iste dolorum temporibus ab tempora voluptas dolores cupiditate veniam voluptates ex nostrum quod, nam rem deleniti! Eaque alias vitae temporibus blanditiis.',
            price
        });
        await haunt.save();
    }
};

seedDB().then(() => {
    db.close();
});