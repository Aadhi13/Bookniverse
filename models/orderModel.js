const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },

    orderDetails: [{
        paymentMethod: String,

        address: {
            Name: String,
            Email: String,
            Mobile: Number,
            HouseName: String,
            PostOffice: String,
            City: String,
            District: String,
            State: String,
            PIN: Number
        },

        orderItems: [{
            productId: {
                type: mongoose.SchemaTypes.ObjectId,
                ref: 'product'
            },
    
            quantity: {
                type: Number,
                default: 1
            }
        }],

        totalPrice : Number,

        status: {
            type: String,
            default: 'Order placed'
        },

        createdAt: {
            type: Date,
            default: Date.now(),
            immutable: true
        }
    }]
});

module.exports = mongoose.model('order',orderSchema);