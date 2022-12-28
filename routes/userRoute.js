const express = require('express');
const userRoute = express();
const session = require('express-session');
const auth = require('../middleware/userAuth')
const config = require('../config/config');
const userController = require('../controllers/userController');
const bodyParser = require('body-parser');

userRoute.use(session({
    secret:config.sessionSecret, 
    cookie: {maxAge: 1000 * 60 * 60 * 24}, //One hour
    resave:false, 
    saveUninitialized:true
}));

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}))

userRoute.set('view engine','ejs');
userRoute.set('views','./views/user');

userRoute.use(express.static('public'));

userRoute.get('/',userController.landingPage);

userRoute.get('/login',auth.isLogout,userController.loginLoad);
userRoute.post('/login',userController.verifyLogin);
userRoute.get('/signup',auth.isLogout,userController.signupLoad);
userRoute.post('/signup',userController.signup);
userRoute.get('/logout',auth.isLogin,userController.userLogout);
userRoute.get('/forgotPassword',userController.passwordResetPageLoad);

userRoute.get('/otpVerify', userController.otpVerifyLoad);
userRoute.post('/otpVerify', userController.otpVerify);
userRoute.post('/resetOtpSend', userController.resetOtpSend);
userRoute.post('/resetOtpSubmit', userController.resetOtpSubmit);
userRoute.post('/submitNewPassword', userController.submitNewPassword);

userRoute.get('/product/:id',userController.productLoad);

userRoute.get('/category/:id',userController.categoryLoad);

userRoute.get('/shop', userController.shopLoad);

userRoute.get('/cart',userController.cartLoad);
userRoute.post('/addToCart',userController.addToCart);
userRoute.post('/changeQuantity',userController.cartChangeQuantity);
userRoute.post('/removeFromCart',userController.removeFromCart);
userRoute.post('/applyCoupon',userController.applyCoupon);

userRoute.get('/wishlist',userController.wishlistLoad);
userRoute.post('/addToWishlist',auth.isLogin,userController.addToWishlist);

userRoute.get('/account',userController.profileLoad);
userRoute.post('/newAddress',auth.isLogin,userController.newAddress);
userRoute.post('/editName',auth.isLogin,userController.editName);
userRoute.get('/deleteAddress/:id',auth.isLogin,userController.deleteAddress);

userRoute.post('/proceedtoCheckout',auth.isLogin,userController.proceedtoCheckout);
userRoute.get('/checkout',auth.isLogin,userController.checkoutLoad);
userRoute.post('/placeOrder',auth.isLogin,userController.placeOrder);
userRoute.post('/verifyPayment',auth.isLogin,userController.verifyPayment);
userRoute.get('/orderConfirmationPage',auth.isLogin,userController.orderConfirmationPage);

userRoute.get('/orders',auth.isLogin,userController.orderPage)
userRoute.post('/orderedProducts',auth.isLogin,userController.orderedProducts);

module.exports = userRoute;