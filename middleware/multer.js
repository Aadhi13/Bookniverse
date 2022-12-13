const path = require('path');
const multer = require('multer');
//we need to setup something in app.js

//multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/assets/productImages");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});
  
const uploadToFile = multer({
    storage: storage
})

module.exports = uploadToFile