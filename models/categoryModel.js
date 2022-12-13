const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    imagePath: {
        type: String,
        required: true
    },
    blockStatus: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('categories', categorySchema);