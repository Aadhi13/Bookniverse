const coupons = require('../models/couponModel')

//To display coupon page in admin panel
const loadCoupon = async (req, res) => {
    try {
        let couponDetails = await coupons.find({}).lean();
        res.render('coupons',{coupons:couponDetails});
    } catch (error) {
        console.log(error.message);
    }
}

//To display new coupon adding page in admin panel
const loadNewCoupon = async (req, res) => {
    try {
        res.render('newCoupon', {message: ""});
    } catch (error) {
        console.log(error.message);
    }
}

//To add new coupon data into database
const addNewCoupon = async (req, res) => {
    try {
        let coupon = new coupons(req.body);
        if (req.body.blockStatus == 0) {
            coupon.blockStatus = false;
        } else {
            coupon.blockStatus = true;
        }
        const couponData = await coupon.save();
        if (couponData) {
            res.redirect('coupons');
        } else {
            res.render('newCoupon', { message: "Something went wrong..."});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To manage blockStatus of coupon
const bStatusCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        const couponData = await coupons.findById({_id:id});
        if (couponData.blockStatus) {
            couponData.blockStatus = false;
            await couponData.save();
        } else {
            couponData.blockStatus = true;
            await couponData.save();
        }
        res.redirect('coupons');
    } catch (error) {
        console.log(error.message);
    }
}

//To display coupon edit page in admin panel 
const loadEditCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        const couponData = await coupons.findById({_id:id});
        if (couponData) {
            res.render('editCoupon', {coupon: couponData, message:""});
        } else {
            console.log('Something is wrong with displaying coupon edit page.');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To add edited data of a coupon into database
const editCoupon = async (req, res) => {
    try {
        const id = req.params.id;
        let {name, couponCode, expiryDate, discountPercentage, priceLimit, blockStatus} = req.body;
        if (blockStatus == 0) {
            blockStatus = false;
        } else {
            blockStatus = true;
        }
        await coupons.updateOne({_id:id}, 
            {
                $set: {
                    name: name,
                    couponCode: couponCode,
                    expiryDate: expiryDate,
                    discountPercentage: discountPercentage,
                    priceLimit: priceLimit,
                    blockStatus: blockStatus
                }
            });
        res.redirect('/admin/coupons');
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    loadCoupon,
    loadNewCoupon,
    addNewCoupon,
    bStatusCoupon,
    loadEditCoupon,
    editCoupon
}