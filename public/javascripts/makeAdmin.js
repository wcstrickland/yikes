const mongoose = require('mongoose');
const User = require('../../models/user');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yikes';
// process.env.DB_URL ||
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

const makeAdministrator = async(id) => {
    try {
        await User.findByIdAndUpdate(id, { isAdmin: true });
    } catch (error) {
        console.log(error);
    }
};