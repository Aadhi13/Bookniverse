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

userRoute.get('/otpVerify', userController.otpVerifyLoad);
userRoute.post('/otpVerify', userController.otpVerify);

userRoute.get('/product/:id',userController.productLoad);

userRoute.get('/category/:id',userController.categoryLoad);

userRoute.get('/shop', userController.shopLoad);

userRoute.get('/cart',userController.cartLoad);
userRoute.post('/addToCart',userController.addToCart);
userRoute.post('/changeQuantity',userController.cartChangeQuantity);
userRoute.post('/removeFromCart',userController.removeFromCart);
userRoute.post('/applyCoupon',userController.applyCoupon);

userRoute.get('/wishlist',userController.wishlistLoad);
userRoute.post('/addToWishlist',userController.addToWishlist);

module.exports = userRoute;