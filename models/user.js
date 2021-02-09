const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true // note this is not validation(does not force uniqueness) it just indicates for indexing
    }
});

/**
 * instead of manually configuring the model mongoose offers 'plugins' and passport supports this
 * this plugin manages things like making unames unqique, hashing/salt pwords 
 */
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);