const bcrypt = require('bcrypt');
const user = require('../models/userModel');
const products = require("../models/productModel");
const category = require("../models/categoryModel");
const orders = require('../models/orderModel');



//Hashing password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

//To login login page of admin
const loadLogin = async (req, res) => {
    try {
        res.render('adminLogin');
    } catch (error) {
        console.log(error.message);
    }
}

//To logout
const logout = async (req, res) => {
    try {
        delete req.session.admin_id;
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

//To display admin home page
const loadHome = async (req, res) => {
    try {
        let userCount = await user.countDocuments();
        let productCount = await products.countDocuments();
        let categoryCount = await category.countDocuments();

        const allOrders = await orders.aggregate([
            {
                $project: {
                    orderDetails: {
                        $filter: {
                            input: '$orderDetails',
                            as: 'orderDetails',
                            cond: {}
                        },
                    },
                    _id: 0,
                },
            },
        ]);
        let orderCount = 0;
        let failedCount = 0;
        let placeOrderCount = 0;
        let packedCount = 0;
        let shippedCount = 0;
        let deliveredCount = 0;
        let cancelledCount = 0;

        if (allOrders) {
            allOrders.forEach((e) => {
                orderCount += e.orderDetails.length
                e.orderDetails.forEach((f) => {
                    if (f.status === 'Order placed') placeOrderCount += 1;
                    else if (f.status === 'Payment failed') failedCount += 1;
                    else if (f.status === 'Packed') packedCount += 1;
                    else if (f.status === 'Shipped') shippedCount += 1;
                    else if (f.status === 'Delivered') deliveredCount += 1;
                    else if (f.status === 'Cancelled') cancelledCount += 1;
                })
            })
        }
        const adminData = await user.findById({ _id: req.session.admin_id });
        console.log('adminData',adminData);
        res.render('home', { admin: adminData, userCount, orderCount, productCount, categoryCount, placeOrderCount, failedCount, packedCount, shippedCount, deliveredCount, cancelledCount });
    } catch (error) {
        console.log(error.message);
    }
}

//To display admin home 2 page
const loadHome2 = async (req, res) => {
    try {
        res.render('adminHome2');
    } catch (error) {
        console.log(error.message);
    }
};

//To display admin users page
const loadUsers = async (req, res) => {
    try {
        const userData = await user.find({is_admin:0});
        res.render('users',{users:userData});
    } catch (error) {
        console.log(error.message);
    }
};

//To display user edit page
const loadEditUser = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await user.findById({_id:id});
        if(userData) {
            res.render('editUser',{user:userData});
        }else{
            res.redirect('/admin/home');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To edit user details
const editUser = async(req,res)=>{
    try {
        const userData = await user.findByIdAndUpdate({ _id:req.body.id},{ $set:{ name:req.body.name, email:req.body.email, is_verified:req.body.verify}});
        res.redirect('/admin/users');
    } catch (error) {
        console.log(error.message);
    }
}

//To manage user block status
const bStatusUser = async(req, res) => {
    try {
        const id = req.query.id;
        const userData = await user.findById({_id:id});
        if(userData.blockStatus == 1) {
            userData.blockStatus = 0
            await userData.save();
        } else {
            userData.blockStatus = 1
            await userData.save();
        }
        res.redirect('users');
    } catch (error) {
        console.log(error.message);
    }
}

//To verify login
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await user.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    res.render('adminLogin', { message: "Email and password is incorrect" });
                }
                else {
                    req.session.admin_id = userData._id;
                    res.redirect('/admin/home');
                }
            }
            else {
                res.render('adminLogin', { message: "Email and password is incorrect" });
            }
        }
        else {
            res.render('adminLogin', { message: "Email and password is incorrect" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    logout,
    loadHome,
    loadUsers,
    loadEditUser,
    loadHome2,
    editUser,
    bStatusUser
}