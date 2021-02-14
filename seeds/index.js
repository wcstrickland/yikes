/**
 * connect to mongo using mongoose
 * clear db
 * seed the db with random data pulled from cities.js and seedHelpers.js
 */

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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
    await Campground.deleteMany({});
    for (let i = 0; i < 20; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6021ffe559b4264591643896',
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [{
                    url: 'https://res.cloudinary.com/wcstrickland/image/upload/v1613329311/YelpCamp/spuhgxikpbpwgtovuo0k.jpg',
                    filename: 'YelpCamp/spuhgxikpbpwgtovuo0k'
                },
                {
                    url: 'https://res.cloudinary.com/wcstrickland/image/upload/v1613328846/YelpCamp/pg7r7gzpfvelc6j1pf64.jpg',
                    filename: 'YelpCamp/pg7r7gzpfvelc6j1pf64'
                }
            ],
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio iste dolorum temporibus ab tempora voluptas dolores cupiditate veniam voluptates ex nostrum quod, nam rem deleniti! Eaque alias vitae temporibus blanditiis.',
            price
        });
        await camp.save();
    }
};

seedDB().then(() => {
    db.close();
});