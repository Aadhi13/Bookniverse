const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    author:{
        type:String,
        required:true
    },
    language:{
        type:String,
        require:true
    },
    publisher:{
        type:String,
        required:true
    },
    isbn:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true
    },
    mrp:{
        type:Number,
        required:true
    },
    srp:{
        type:Number,
        required:true
    },
    category:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'categories',
    },
    description:{
        type:String,
        required:true
    },
    blockStatus: {
        type: Number,
        required: true
    },
    categoryBlockStatus: {
        type: Number,
        default: 0,
    },
    imagePath: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('product', productSchema);