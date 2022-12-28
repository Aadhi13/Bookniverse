const orders = require('../models/orderModel');

//To display order page in admin panel
const loadOrder = async (req, res) => {
    try {
        let orderData = await orders.find({}).sort({ 'orderDetails.createdAt': -1 });
        orderData = orderData[0].orderDetails;
            orderData.forEach(e => {
                date = e.createdAt;
                e.date = date.toDateString();
            })
        res.render('orders',{orderData})

    } catch (error) {
        console.log(error.message);
    }
}

//To display edit/update order status page in admin panel
const loadEditOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        let orderData = (await orders.findOne({'orderDetails._id':orderId},{orderDetails:{$elemMatch:{_id:orderId}}}).populate('orderDetails.orderItems.productId')).orderDetails[0];
        let data = orderData;
        orderData = orderData.orderItems;
        res.render('editOrder', { productDetails: orderData, data });
    } catch (error) {
        console.log(error.message);
    }
}

//To edit/update order status 
const changeOrderStatus = async (req, res) => {
        let status = req.body.orderStatus;
        let orderId = req.body.orderId;
        await orders.updateOne({orderDetails:{$elemMatch:{_id:orderId}}},{'orderDetails.$.status':status})
        res.redirect('/admin/orders');
}

module.exports = {
    loadOrder,
    loadEditOrder,
    changeOrderStatus
}