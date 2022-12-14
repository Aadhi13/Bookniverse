const mongoose = require('mongoose');

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'users'
    },

    cartItems: [{
        productId: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'products'
        },

        quantity: {
            type: Number,
            default: 1
        }
    }]
});

module.exports = mongoose.model('cart', cartSchema);