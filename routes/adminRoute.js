const express = require('express');
const adminRoute = express();
const path = require('path');
const adminController = require('../controllers/adminController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const bannerController = require('../controllers/bannerController');
const couponController = require('../controllers/couponController');
const auth = require('../middleware/adminAuth');
const uploadToFile = require('../middleware/multer');
const oneDay = 1000 * 60 * 60 * 24;

const session = require('express-session');
const config = require('../config/config');
adminRoute.use(
    session({
        name: "session-1",
        secret: "this is a secret key",
        cookie: { maxAge: oneDay},
        saveUninitialized: false,
        resave: false
    })
);


const bodyParser = require("body-parser");
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({extended:true}));
adminRoute.use(express.static('public'));


adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

adminRoute.get('/', auth.isLogout, adminController.loadLogin);
adminRoute.post('/', adminController.verifyLogin);

adminRoute.get('/home',auth.isLogin,adminController.loadHome);
adminRoute.get('/logout',auth.isLogin,adminController.logout);
adminRoute.get('/adminDashboard',auth.isLogin,adminController.loadHome);
adminRoute.get('/users',auth.isLogin,adminController.loadUsers);
adminRoute.get('/adminHome2',auth.isLogin,adminController.loadHome2);

adminRoute.get('/editUser',auth.isLogin,adminController.loadEditUser);
adminRoute.post('/adminEditUser',auth.isLogin,adminController.editUser);
adminRoute.get('/bStatusUser',auth.isLogin,adminController.bStatusUser);

adminRoute.get('/categories',auth.isLogin,categoryController.loadCategories);
adminRoute.post('/newCategory',auth.isLogin,uploadToFile.single('image', 12),categoryController.addCategory);
adminRoute.get('/categoryStatus',auth.isLogin,categoryController.categoryStatus);
adminRoute.get('/editCategory',auth.isLogin,categoryController.loadEditCategory);
adminRoute.post('/editCategory/:id',auth.isLogin,uploadToFile.single('image', 12),categoryController.editCategory)

adminRoute.get('/products',auth.isLogin,productController.loadProducts);
adminRoute.get('/newProduct',auth.isLogin,productController.loadNewProduct);
adminRoute.post('/newProduct',auth.isLogin,uploadToFile.single('image',12),productController.addNewProduct);
adminRoute.get('/editProduct',auth.isLogin,productController.loadEditProduct);
adminRoute.post('/editProduct/:id',auth.isLogin,uploadToFile.single('image',12),productController.editProduct);
adminRoute.get('/productStatus',auth.isLogin,productController.productStatus);

adminRoute.get('/banners',auth.isLogin,bannerController.loadBanners);
adminRoute.get('/newBanner',auth.isLogin,bannerController.loadNewBanner);
adminRoute.post('/newBanner',auth.isLogin,uploadToFile.single('image', 12),bannerController.addNewBanner);
adminRoute.get('/editBanner',auth.isLogin,bannerController.loadEditBanner);
adminRoute.post('/editBanner/:id',auth.isLogin,uploadToFile.single('image', 12),bannerController.editBanner);
adminRoute.get('/deleteBanner',auth.isLogin,bannerController.deleteBanner);

adminRoute.get('/coupons',auth.isLogin,couponController.loadCoupon);
adminRoute.get('/newCoupon',auth.isLogin,couponController.loadNewCoupon);
adminRoute.post('/newCoupon',auth.isLogin,couponController.addNewCoupon);
adminRoute.get('/bStatusCoupon',auth.isLogin,couponController.bStatusCoupon);
adminRoute.get('/editCoupon',auth.isLogin,couponController.loadEditCoupon);
adminRoute.post('/editCoupon/:id',auth.isLogin,couponController.editCoupon);

module.exports = adminRoute;