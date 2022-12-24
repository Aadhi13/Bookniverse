const user = require('../models/userModel');
const product = require('../models/productModel');
const category = require('../models/categoryModel');
const banner = require('../models/bannerModel');
const cart = require('../models/cartModel');
const coupon = require('../models/couponModel');
const wishlist = require('../models/wishlistModel');
const address = require('../models/addressModel');
const order = require('../models/orderModel');
const bcrypt = require('bcrypt');
const config = require('../config/config');
const nodemailer = require('nodemailer');
const { Query, default: mongoose } = require('mongoose');
const { response } = require('../routes/userRoute');
const { stat } = require('fs');
const { log } = require('console');
let signupName, signupEmail, signupPassword, OTP, lowest, highest;
let couponCodeV;
let totalPrice;


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
        if(req.session.user_id){
            let userId = req.session.user_id;
            let userData = await user.findById({_id:userId});
            res.render('landingPage', {  signedin: true, user: userData, product: productData, category: categoryData, banner:bannerData});
        } else {
            res.render('landingPage', { signedin: false, product: productData, category: categoryData, banner:bannerData});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To display login page
const loginLoad = async (req, res) => {
    try {
        res.render('loginRegister', {status: true});
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
                            res.redirect('/');
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

//To display password reset page to user
const passwordResetPageLoad = async (req, res) => {
    try {
        res.render('passwordReset');
    } catch (error) {
        console.log(error.message);
    }

}

//To send reset otp 
const resetOtpSend = async (req, res) => {
    console.log('inside resetOtpSend');
    try {
       const userId = req.session.user_id;
       const userData = await user.findOne({userId:userId});
       const signupName = user.name;
       if (userData) {
        console.log('inside userData');
        let OTP1 = `${Math.floor(1000 + Math.random() * 9000)}`;
            OTP = OTP1;
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
            mailTransporter.sendMail(mailDetails, function (err, data) {
                if (err) {
                    console.log("Error Occurs");
                } else {
                    console.log("OTP sent successfully");
                }
            });
            res.json({ status: true });
       }

    } catch (error) {
       console.log(error.message); 
    }
}

//To display signup page
const signupLoad = async (req, res) => {
    try {
        res.render('loginRegister', {status: false})
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
            res.render('loginRegister', {SRMessage: "You have successfully registerd, you can now login with your email and password.", status:false});
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
        const cateCount = await product.aggregate([
            {"$group" : {_id:"$category", count:{$sum:1}}}
        ])
        
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
        if (req.query.searchText) {
            query.$or = [
                { name: { $regex: '.*' + req.query.searchText + '.*', $options: 'i' }}
            ]
        }
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

            console.log('inside req.session.user_id');

            const user1 = req.session.user_id;
            const userId = mongoose.Types.ObjectId(user1);
            const userData = await user.findById({_id: req.session.user_id});

            console.log('userData',userData);

            let products = await cart.findOne({ userId: userId }).populate('cartItems.productId').lean();
            
            let subTotal = 0;
            let shippingCost = 0;
            let total = 0;
            if (!products) {

                console.log('inside !products');

                res.render('cart404', {user:userData, category:categoryData, message: 'Cart is empty... Continue shopping...'});
            } else {

                console.log('inside else of !products');
                console.log('products.cartItems',products.cartItems);
                console.log('products',products);

                let productDetails = products.cartItems;
                productDetails.forEach((element) => {
                        subTotal += (element.productId.srp * element.quantity);
                });
                if (subTotal > 500) {
                    shippingCost = 0;
                } else {
                    shippingCost = 50;
                }
                total = subTotal + shippingCost;
                const cartLength = productDetails.length;
                if (cartLength != 0) {

                    console.log('inside cartLength');
                    
                    res.render('cart', {user:userData, category:categoryData, product:productDetails, cartList:products, cartLength, subTotal:subTotal, shippingCost, total, couponDiscount:0, message:""});
                } else if (cartLength == 0) {

                    console.log('inside else if of cartLength');                    

                    shippingCost = 0;
                    total = 0;
                    res.render('cart404', {user:userData, category:categoryData, message: 'Cart is empty... Continue shopping...'});
                }
            }
        } else {
            
            console.log('inside else of req.session.user_id');

            res.render('cart404', {user:'', category: categoryData});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To add products into cart
const addToCart = async (req, res) => {
    console.log('inside addToCart');
    try {
        const categoryData = await category.find({blockStatus:0});
        if (req.session.user_id) {
            const proId = req.body.productId;
            const productId = new mongoose.Types.ObjectId(proId)
            const userId = req.session.user_id;
            
            const userExist = await cart.findOne({userId});

            if(userExist) {
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
            res.render('cart404', {category: categoryData});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To change quantity of products in cart
const cartChangeQuantity = async (req, res) => {
    try {
        let { productId, count } = req.body;
            count = parseInt(count);
            productId = mongoose.Types.ObjectId(productId);
            let productPrice = await product.findById({_id:productId});
            productPrice = productPrice.srp;
            const userId = req.session.user_id;
            const currentQuantity = await cart.findOne({ userId: userId, 'cartItems.productId': productId }, { cartItems: { $elemMatch: { productId: productId } } });
            const value = currentQuantity.cartItems[0].quantity;
            let uValue = 0;
            if (!(value == 1 && count == -1)) {
                uValue = value + count;
            }
            if (!(value == 1 && count == -1)) {
                await cart.updateOne({ userId: userId, 'cartItems.productId': productId }, { $inc: { 'cartItems.$.quantity': count } }).then((response) => {
                    res.json({srp:productPrice, quantity:uValue});
                }).catch((err) => console.log(err.message));
            } else {
                next();
            }
    } catch (error) {
        console.log(error.message);
    }
}

//To remove products from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { productId } = req.body;
        await cart.updateOne({ userId: userId}, { $pull: {cartItems: { productId: productId } } }).then((response) => {
            res.json(response);
        });
    } catch (error) {
        console.log(error.message);
    }
}

//To apply coupon 
const applyCoupon = async (req, res) => {
    try {
        let { couponCode } = req.body;
        couponCode = couponCode.toUpperCase();
        await coupon.findOne({ couponCode:couponCode, blockStatus: false }).then((result) => {
            res.json(result);
        });
    } catch (error) {
        console.log(error.message);
    }
}

//To display wishlist page
const wishlistLoad = async (req, res) => {
    try {
        const categoryData = await category.find({blockStatus:0});
        if (req.session.user_id) {
            const userId = mongoose.Types.ObjectId(req.session.user_id);
            const userData = await user.findById({_id: req.session.user_id});
            const userWishList = await wishlist.findOne({userId: userId}).populate('productId').lean();
            console.log('userWishlist'.userWishList);
            if(!userWishList) {
                res.render('wishlist', {user: userData, category: categoryData, wishlistProducts: false, message: 'Wishlist is empty... Continue shopping...'})
            } else {
                const productArray = userWishList.productId;
                const wishlistLength = productArray.length;
                if (wishlistLength != 0) {
                    console.log('userWishList',userWishList);
                    res.render('wishlist', {user: userData, category: categoryData, wishlistProducts:userWishList ,message: false});
                } else {
                    res.render('wishlist', {user: userData, category: categoryData, wishlistProducts: false, message: 'Wishlist is empty... Continue shopping...'})
                }
            }
        } else {
            res.render('wishlist', {user: false, category: categoryData, wishlistProducts: false, message: 'Wishlist is empty... Login to add products into wishlist...'})
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To add products into wishlist
const addToWishlist =  async (req, res) => {
    console.log('inside addToWishlist');
    try {
        if (req.session.user_id) {
            let userId = req.session.user_id;
            const userWishList = await wishlist.findOne({ userId: userId }); //null            
            const { productId } = req.body;
            const product_id = mongoose.Types.ObjectId(productId);
            if (userWishList) {
                const products = userWishList.productId;
                const existStatus = await products.includes(product_id, 0);
                const user_id = mongoose.Types.ObjectId(userId).toString();
                if (!existStatus) {
                    await wishlist.updateOne({ userId: user_id }, { $push: { productId: product_id } });
                    res.json({ wishlistStatus: true });
                } else {
                    await wishlist.updateOne({ userId: user_id }, { $pull: { productId: product_id } }).then((response) => {
                        res.json({ wishlistStatus: false });
                    })
                }
            } else {
                try {
                    const wishlistData = new wishlist({
                        userId: userId,
                        productId: product_id
                    })
                    await wishlistData.save();
                    res.json({ wishlistStatus: true });
                } catch (error) {
                    console.log(error.message);
                }
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To display user profile page
const profileLoad = async (req, res) => {
    const categoryData = await category.find({blockStatus:0});
    try {
        if (req.session.user_id) {
            const userId = req.session.user_id;
            const userData = await user.findOne({_id:userId}).lean(); 
            const userAddress = await address.findOne({userId: userId}).lean();
            if (userAddress) {
                const address = userAddress.addresses;
                res.render('profile', {userData, address, category: categoryData});
            } else {
                res.render('profile', {userData, address:false, category: categoryData});
            }
        } else {
            res.render('profile',{userData:false, address:false, category:categoryData});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To add new address for user
const newAddress = async (req, res) => {
        const { Name, Email, Mobile, HouseName, PostOffice, City, District, State, PIN } = req.body;
        const userId = req.session.user_id;
        const adr = await address.findOne({ userId: userId });
        if (adr) {
            await address.updateOne({ userId: userId }, { $push: { addresses: { Name, Email, HouseName, Mobile, PostOffice, City, District, State, PIN } } });
        } else {
            const addressData = new address({
                userId: userId,
                addresses: { Name, Email, Mobile, HouseName, PostOffice, City, District, State, PIN }
            });
            await addressData.save();
        }
        if (req.body.page == 'checkout') {
            res.redirect('/checkout');
        } else {
            res.redirect('/account');
        }
}
const editName = async (req, res) => {
    await user.updateOne({ _id: req.body.userId }, { name: req.body.Name });
    res.json({ status: true });
}

const deleteAddress = async (req, res) => {
    const userData = await user.findOne({ _id: req.session.user_id});
    const userId = userData._id;
    const addressId = req.params.id;
    await address.updateOne({ userId: userId }, { $pull: { addresses: { _id: addressId } } });
    res.redirect('/account');
}

//Proceed to checkout
const proceedtoCheckout = async (req, res) => {
    const couponCode = req.body.couponCode;
    couponCodeV = await coupon.findOne({couponCode:couponCode, blockStatus:false});
    res.json({ status: true });
}

//To display checkout page
const checkoutLoad = async (req, res) => {
    const categoryData = await category.find({blockStatus:0});
    try {
        const userId = req.session.user_id;
        const userData = await user.findOne({userId:userId});
        const userAddress = await address.findOne({userId:userId}).lean();
        if (userAddress) {

            const user_Id = mongoose.Types.ObjectId(userId);
            let products = await cart.findOne({ userId: user_Id}).populate('cartItems.productId').lean();
            let subTotal = 0;
            let shippingCost = 0;
            let total = 0;
            let productDetails = products.cartItems;
                productDetails.forEach((element) => {
                        subTotal += (element.productId.srp * element.quantity);
                });
            if (subTotal > 500) {
                shippingCost = 0;
            } else {
                shippingCost = 50;
            }
            if (couponCodeV) {
                let discountPrice = Math.round(subTotal * couponCodeV.discountPercentage / 100)
                subTotal = subTotal - discountPrice;
                total = subTotal + shippingCost;
            } else {
                total = subTotal + shippingCost;
            }

            totalPrice = total;
            const address = userAddress.addresses;
            res.render('checkout', {userAddress: address, status: true, total, category: categoryData, user:userData});
        } else {
            console.log('else is working');
            res.render('checkout', {status: false});
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To place order
const placeOrder = async (req, res) => {
    let addressId;
    console.log(req.body)
    const { status, paymentMethod} = req.body;
    const addressData = req.body.address;
    paymentMethodAnotherFunction = paymentMethod;
    // const userEmail = req.session.customer;
    // const user = await Users.findOne({ Email: userEmail });
    const userId = req.session.user_id;
    const orderItems = (await cart.findOne({ userId: userId })).cartItems;
    const orderInfo = await order.findOne({ userId });
    const adr = await address.findOne({ userId: userId })
    if (status == 'first') {
        const { Name, Email, Mobile, HouseName, PostOffice, City, District, State, PIN } = req.body;
        if (adr) {
            await address.updateOne({ userId: userId }, { $push: { addresses: { Name, Email, HouseName, Mobile, PostOffice, City, District, State, PIN } } });
            addressId = ((await address.findOne({ userId: userId })).addresses)[0]._id;
            addressId = mongoose.Types.ObjectId(addressId);
            addressFromAnotherFunction = addressId;
        } else {
            const addressData = new address({
                userId: userId,
                addresses: { Name, Email, HouseName, Mobile, PostOffice, City, District, State, PIN }
            });
            await addressData.save();
            addressId = ((await address.findOne({ userId: userId })).addresses)[0]._id;
            addressId = mongoose.Types.ObjectId(addressId);
            addressFromAnotherFunction = addressId;
        }

        if (paymentMethod == 'Cash on Delivery') {
            if (orderInfo) {
                const shippingAddress = ((await address.findOne({ userId }, { addresses: { $elemMatch: { _id: addressId } } })).addresses)[0];
                await order.updateOne({ userId: userId }, { $push: { orderDetails: { paymentMethod, address: shippingAddress, orderItems, totalPrice } } });
                await cart.deleteOne({ userId });
            } else {
                const shippingAddress = ((await address.findOne({ userId }, { addresses: { $elemMatch: { _id: addressId } } })).addresses)[0];
                const order = new order({
                    userId,
                    orderDetails: { paymentMethod, address: shippingAddress, orderItems, totalPrice }
                });
                await order.save();
                await cart.deleteOne({ userId });
            }
            res.json({ codSuccess: true });
        } else {
            const shippingAddress = ((await address.findOne({ userId }, { addresses: { $elemMatch: { _id: addressId } } })).addresses)[0];
            if (orderInfo) {
                await order.updateOne({ userId }, { $push: { orderDetails: { paymentMethod, address: shippingAddress, orderItems, totalPrice, status: 'Payment failed' } } });
            } else {
                const orderNew = new orders({
                    userId,
                    orderDetails: { paymentMethod: paymentMethodAnotherFunction, address: shippingAddress, orderItems, totalPrice, status: 'Payment failed' }
                });
                await orderNew.save();
            }
            let orderData = await order.findOne({ userId: userId }, { orderDetails: { $slice: -1 } });
            let total = (orderData.orderDetails[0]).totalPrice;
            totalFromAnotherFunction = total;
            let options = {
                amount: total * 100,
                currency: 'INR',
                receipt: '' + orderData.orderDetails[0]._id
            }

            razorpayInstance.orders.create(options,
                (err, orderData) => {
                    if (!err) res.json(orderData);
                    else res.send(err);
                }
            );
        }
    } else {
        addressId = addressData;
        if (paymentMethod == 'Cash on Delivery') {
            const shippingAddress = ((await address.findOne({ userId }, { addresses: { $elemMatch: { _id: addressId } } })).addresses)[0];
            if (orderInfo) {
                await order.updateOne({ userId: userId }, { $push: { orderDetails: { paymentMethod, address: shippingAddress, orderItems, totalPrice } } });
                await cart.deleteOne({ userId });
            } else {
                const orderData = new order({
                    userId,
                    orderDetails: { paymentMethod, address: shippingAddress, orderItems, totalPrice}
                });
                await orderData.save();
                await cart.deleteOne({ userId });
            }
            res.json({ codSuccess: true });
        } else {
            const shippingAddress = ((await address.findOne({ userId }, { addresses: { $elemMatch: { _id: addressId } } })).addresses)[0];
            if (orderInfo) {
                await order.updateOne({ userId }, { $push: { orderDetails: { paymentMethod, address: shippingAddress, orderItems, totalPrice, status: 'Payment failed' } } });
            } else {
                const orderNew = new order({
                    userId,
                    orderDetails: { paymentMethod: paymentMethodAnotherFunction, address: shippingAddress, orderItems, totalPrice, status: 'Payment failed' }
                });
                await orderNew.save();
            }
            let orderData = await order.findOne({ userId: userId }, { orderDetails: { $slice: -1 } });
            let total = orderData.orderDetails[0].totalPrice;
            totalFromAnotherFunction = total;
            addressFromAnotherFunction = addressId;
            let options = {
                amount: total * 100,
                currency: 'INR',
                receipt: '' + orderData.orderDetails[0]._id
            };

            razorpayInstance.order.create(options,
                (err, orderData) => {
                    if (!err) res.json(orderData);
                    else {
                        res.send(err);
                    }
                }
            );
        }
    } 
}

//order Confirmation Page
const orderConfirmationPage = async (req, res) => {
    try {
        const categoryData = await category.find({blockStatus:0});
        const user_Id = req.session.user_id;
        const userData = await user.findOne({userId:user_Id});
        const userId = (await user.findOne({ userId: user_Id}))._id;
        const orderData = await order.findOne({userId: userId}, {orderDetails: {$slice: -1}}).lean();
        const orderDetails = (orderData.orderDetails)[0];
        const date = orderDetails.createdAt.toDateString();
        res.render('orderConfirmationPage', {orderDetails, date, category: categoryData, user: userData});
    } catch (error) {
        console.log(error.message);
    }
}

//To display orders page
const orderPage = async (req, res) => {
    try {
        const categoryData = await category.find({blockStatus:0});
        const user_Id = req.session.user_id;
        const userData = await user.findOne({userId:user_Id});
        const userId = mongoose.Types.ObjectId(req.session.user_id);
        let allOrders = await order.findOne({userId});
        if(allOrders) {
            allOrders = allOrders.orderDetails;
            allOrders.forEach(e => {
                date = e.createdAt;
                e.date = date.toDateString();
            })
            res.render('order', {allOrders, user: userData, category: categoryData, message:false});
        } else {
            res.render('order', { message: 'No orders found... Continue shopping...', user: userData, category: categoryData, allOrders:false});
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
    passwordResetPageLoad,
    signupLoad,
    signup,
    userLogout,
    productLoad,
    categoryLoad,
    otpVerifyLoad,
    otpVerify,
    shopLoad,
    cartLoad,
    addToCart,
    cartChangeQuantity,
    removeFromCart,
    applyCoupon,
    wishlistLoad,
    addToWishlist,
    profileLoad,
    newAddress,
    editName,
    deleteAddress,
    checkoutLoad,
    proceedtoCheckout,
    placeOrder,
    orderConfirmationPage,
    orderPage,
    resetOtpSend
}