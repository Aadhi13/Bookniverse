const user = require('../models/userModel');
const product = require('../models/productModel');
const category = require('../models/categoryModel');
const banner = require('../models/bannerModel');
const cart = require('../models/cartModel');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const { Query, default: mongoose } = require('mongoose');
let signupName, signupEmail, signupPassword, OTP, lowest, highest;

//For OTP
let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "bookstoreverify@gmail.com",
        pass: "qpkcnoqguybyiudv",
    },
});

//Function to generate OTP
function generateOTP() {
          
    // Declare a digits variable 
    // which stores all digits
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

//To secure password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

//To display landing page
const landingPage = async (req, res) => {
    const productData = await product.find({blockStatus:0}).limit(8);
    const categoryData = await category.find({blockStatus:0});
    const bannerData = await banner.find();
    try {
        res.render('landingPage', {product: productData, category: categoryData, banner: bannerData});
    } catch (error) {
        console.log(error.message);
    }
}

//To display user home page
const userHome = async (req, res) => {
    const productData = await product.find({blockStatus:0}).limit(8);
    const categoryData = await category.find({blockStatus:0});
    const bannerData = await banner.find();
    try {
        const userData = await user.findById({_id: req.session.user_id});
        res.render('userHome', { user: userData, product: productData, category: categoryData, banner: bannerData});
    } catch (error) {
        console.log(error.message);
    }
}

//To display login page
const loginLoad = async (req, res) => {
    try {
        res.render('loginRegister');
    } catch (error) {
        console.log(error.message);
    }
}

//To verify login
const verifyLogin = async (req, res) => {
    try {
        const {email, password} = req.body;
        const userData = await user.findOne({ email: email });
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                if (userData.is_admin === 0) {
                    if (userData.blockStatus === 0) {
                        if (userData.is_verified === 1) {
                            req.session.user_id = userData._id;
                            res.redirect('/userHome');
                        } else {
                            res.render('loginRegister', {message: "This account is not verified."});
                        }
                    } else {
                        res.render('loginRegister', { message: "This account is forbidden on this website. For more information, get in touch with customer service."});
                    }
                }
                else {
                    res.render('loginRegister', { message: "Email and password is incorrect." });
                }
            }
            else {
                res.render('loginRegister', { message: "Email and password is incorrect." });
            }
        }
        else {
            res.render('loginRegister', { message: "Email and password is incorrect." });
        }

    } catch (error) {
        console.log(error.message);
    }
}

//To display signup page
const signupLoad = async (req, res) => {
    try {
        res.render('loginRegister')
    } catch (error) {
        console.log(error.message);
    }
}

//To recieve user data and sent otp to users email
const signup = async (req, res) => {
    try {
        OTP = generateOTP();
        signupName = req.body.name;
        signupEmail = req.body.email;
        signupPassword = await securePassword(req.body.password);
        let mailDetails = {
            from: "bookstoreverify@gmail.com",
            to: signupEmail,
            subject: "Verify your email address",
            html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <div style="border-bottom:1px solid #eee">
                            <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Book Store</a>
                        </div>
                        <p style="font-size:1.1em">Hi, ${signupName}</p>
                        <p>Thank you for choosing Book Store. Use the following OTP to complete your Sign Up procedures. OTP is valid for 10 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
                        <p style="font-size:0.9em;">Regards,<br />Store Book</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>Book Store Inc</p>
                            <p>1600 Amphitheatre Parkway</p>
                            <p>California</p>
                        </div>
                    </div>
                </div>`,
        };
        const userData = await user.findOne({email:signupEmail})
        if (userData){
            res.render('loginRegister', { FRMessage: 'This email address is already exist. Try login.' });
        } else {
            mailTransporter.sendMail(mailDetails, function (err, data){
                if (err) {
                    console.log('Error occurs');
                } else {
                    console.log('Email sent successfully');
                    res.redirect('/otpVerify')
                }
            });
        }
    } catch (error) {
        console.log(error.messsage);
    }
}

//To display otp entering page to user
const otpVerifyLoad = async (req, res) => {
    try {
        res.render('otpVerify', {email:signupEmail});
    } catch (error) {
        console.log(error.message);
    }
}

//To verify otp and add new user data into database
const otpVerify = async (req, res) => {
    try {
        let otp = req.body.a+req.body.b+req.body.c+req.body.d+req.body.e+req.body.f;
        if (otp === OTP) {
            const userData = await user.create(
                {
                    name: signupName, 
                    email: signupEmail, 
                    password: signupPassword, 
                    blockStatus: 0, 
                    is_admin: 0, 
                    is_verified: 1
                }
            );
            res.render('loginRegister', {SRMessage: "You have successfully registerd, you can now login with your email and password."});
        } else {
            res.render('otpVerify', {FRMessage: "Entered OTP is invalid.", email:signupEmail});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To logout 
const userLogout = async(req,res) => {
    try {
       delete req.session.user_id;
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

//To display product page
const productLoad = async (req, res) => {
    try {
        const id = req.params.id;
        const productData = await product.findById(id);
        res.render('product', {product:productData});
    } catch (error) {
        console.log(error.message);
    }
}

//To display category page
const categoryLoad = async (req, res) => {
    try {
        const catId = req.params.id;
        const categoryS = await category.findById({_id:catId});
        const categoryData = await category.find({blockStatus:0});
        const productData = await product.find({$and:[{category:{$eq:catId}},{blockStatus:0}]});
        let userData;
        if (req.session.user_id) {
            userData = await user.findById({ _id: req.session.user_id });
        }
        res.render('category', {product:productData, category:categoryData, categoryS:categoryS, user:userData});
    } catch (error) {
        console.log(error.message);
    }
}

//To display shop page to user
const shopLoad = async (req, res) => {
    try {
        
        const langCount = await product.aggregate([
            {"$group" : {_id:"$language", count:{$sum:1}}}
        ])
        console.log(langCount, 'langCount');
        
        const cateCount = await product.aggregate([
            {"$group" : {_id:"$category", count:{$sum:1}}}
        ])
        console.log(cateCount, 'cateCount');

        
        let sort = {};
        let checkLabel = true;
        const productLang = await product.aggregate([ { $group:{ _id:null, language:{$addToSet:"$language"}}} ]);
        const proLanguage = productLang[0].language;

        const categoryData = await category.find({blockStatus:0}).lean();
        if (req.query.price == 'price-1') {
            lowest = 0;
            highest = 500;
        } else if (req.query.price == 'price-2') {
            lowest = 500;
            highest = 1000;
        } else if (req.query.price == 'price-3') {
            lowest = 1000;
            highest = 1500;
        } else if (req.query.price == 'price-all') {
            lowest = 0;
            highest = 9999999;
        }
        let query = {$and: [{ blockStatus: 0}, {categoryBlockStatus:0}]};
        if (req.query.category) {
            if (req.query.category != 'all') {
                query.category = req.query.category;
                checkLabel = false;
            }
        }
        if (req.query.language) {
            if (req.query.language != 'all') {
                query.language = req.query.language;
                checkLabel = false;
            }
        }
        if (req.query.price) {
            if (req.query.price != 'all') {
                query.srp = { "$gt": lowest, "$lt": highest};
                checkLabel = false;
            }
        }
        if (req.query.sort) {
            if (req.query.sort == -1) {
                sort.srp = -1;
            } else {
                sort.srp = 1;
            }
        }
        let productData = await product.find(query).sort(sort).lean();
        let userData;
        if (req.session.user_id) {
            userData = await user.findById({ _id: req.session.user_id });
        }
        
        res.render('shop', {user: userData, category: categoryData, productLang: proLanguage, product: productData, checkLabel, langCount, cateCount});
    } catch (error) {
        console.log(error.message);
    }
}

//To display cart page to user
const cartLoad = async (req, res) => {
    const categoryData = await category.find({blockStatus:0});
    try {
        if (req.session.user_id) {
            const user = req.session.user_id;
            const user_id = mongoose.Types.ObjectId(user);
        }
       res.render('cart', {category: categoryData});
    } catch (error) {
        console.log(error.message);
    }
}

//To add products into cart
const addToCart = async (req, res) => {
    try {
        if (req.session.user_id) {
            const proId = req.params.id;
            const productId = new mongoose.Types.ObjectId(proId)
            const userId = req.session.user_id;
            console.log('userId = ', userId);
            
            const userExist = await cart.findOne({userId});

            console.log('userExist', userExist);

            if(userExist) {
                console.log('inside userExist');
                const productExist = await cart.findOne({ $and: [ {userId}, {cartItems: {$elemMatch: {productId} } } ] });
                console.log('prdouctExist = ', productExist);
                if (productExist) {
                    console.log('inside productExist');
                    await cart.findOneAndUpdate({ $and: [{ userId }, { "cartItems.productId": productId }] }, { $inc: { "cartItems.$.quantity": 1 } });
                    res.send({ success: true });
                } else {
                    console.log('inside productExist else');
                    await cart.updateOne({ userId }, { $push: { cartItems: { productId, quantity: 1 } } });
                    res.send({ success: true });
                }
            } else {
                console.log('inside userExist else');
                const cartDetails = new cart ({ userId, cartItems: [{ productId, quantity: 1 }] })
                await cartDetails.save()
                    .then(() => {
                        res.send('success');
                    })
                    .catch((err) => {
                        console.log(err.message);
                    })
            }
        } else {
            console.log('You are not logged in');
        }
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    landingPage,
    loginLoad,
    securePassword,
    verifyLogin,
    signupLoad,
    signup,
    userHome,
    userLogout,
    productLoad,
    categoryLoad,
    otpVerifyLoad,
    otpVerify,
    shopLoad,
    cartLoad,
    addToCart
}