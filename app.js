const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/bookStore');
const express = require('express');
const app = express();
const adminRoute = require('./routes/adminRoute');
const userRoute = require('./routes/userRoute');
const fs = require('fs');
const PORT = 3000;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const oneDay = 1000 * 60 * 60 * 24;


const path = require('path');
app.use('css',express.static(path.join(__dirname, "/public")));
app.use('js',express.static(path.join(__dirname, "/public")));

//Session middleware
app.use(
    session({
        name: "session-1",
        secret: "this is a secret key",
        cookie: { maxAge: oneDay},
        saveUninitialized: false,
        resave: false
    })
);

app.use(cookieParser());

app.use(function (req, res, next) {
    res.set(
        "Cache-Control",
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    );
    next();
});

//For multer purpose
if (!fs.existsSync("./public/assets/productImages")) {
    fs.mkdirSync("./public/assets/productImages");
}
app.use("./public/assets/productImages", express.static("productImages"));

//For admin routes
app.use('/admin',adminRoute);

//For user routes
app.use('/', userRoute);

app.listen(PORT, () => {
    console.log('Server is running on port '+PORT+'...');
});