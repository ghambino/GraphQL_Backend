const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favoriteGenre: {
        type: String,
        required: true
    }
})
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);