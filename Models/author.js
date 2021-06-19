const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLenghth: 4
    },
    born: {
        type: Number
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    }
});

authorSchema.plugin(uniqueValidator)
module.exports = mongoose.model('Author', authorSchema)

