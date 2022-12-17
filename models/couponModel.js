const mongoose = require('mongoose');
const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    couponCode: {
        type: String,
        uppercase: true,
        required: true,
        unique: true
    },
    discountPercentage: {
        type: Number,
        required: true
    },
    blockStatus: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('coupons',couponSchema);    