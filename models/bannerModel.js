const mongoose = require('mongoose');
const bannerSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    imagePath: {
        type: String,
        require: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        immutable: true
    }
});

module.exports = mongoose.model('banner', bannerSchema);