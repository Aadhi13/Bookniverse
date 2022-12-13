const banners = require('../models/bannerModel');

//To display banner page in admin panel
const loadBanners = async (req, res) => {
    try {
        const bannerData = await banners.find({});
        res.render('banners', {banners: bannerData});
    } catch (error) {
        console.log(error.message);
    }
};

//To display new banner adding page in admin panel
const loadNewBanner = async (req, res) => {
    try {
        res.render('newBanner');
    } catch (error) {
        console.log(error.message);
    }
};

//To add banner data to database
const addNewBanner = async (req, res) => {
    let imagePath = req.file.path;
    imagePath = imagePath.replace('public/', '');
    try {
       let banner = new banners(req.body);
        banner.imagePath = imagePath;
        const bannerData = await banner.save();
        if (bannerData) {
            res.redirect('banners');
        } else {
            res.render('newBanner', { message: "Something went wrong..."});
        }
    } catch (error) {
        console.log(error.message);
    }
};

//To display edit banner page in admin panel
const loadEditBanner = async (req, res) => {
    try {
        const id = req.query.id;
        const bannerData = await banners.findById({_id:id});
        if (bannerData) {
            res.render('editBanner', {banner: bannerData});
        } else {
            console.log('Something wrong with displaying banner edit page.');
        }
    } catch (error) {
        console.log(error.message);
    }
};

//To edit a existing banner
const editBanner = async (req, res) => {
    try {
        const id = req.params.id;
        let {name} = req.body;
        let imagePath;
        if (req.file) {
            imagePath = req.file.path;
            imagePath = imagePath.replace('public/', '');
        } else {
            const bannerData = await banners.findById({_id:id});
            imagePath = bannerData.imagePath;
        }
        await banners.updateOne({_id:id},
            {
                $set: {
                    name: name,
                    imagePath: imagePath,
                }
            });
        res.redirect('/admin/banners');
    } catch (error) {
        console.log(error.message);
    }
};

//To delete a banner
const deleteBanner = async (req, res) => {
    try {
        const id = req.query.id;
        await banners.deleteOne({_id:id});
        res.redirect('/admin/banners');
    } catch (error) {

    }
};

module.exports = {
    loadBanners,
    loadNewBanner,
    addNewBanner,
    loadEditBanner,
    editBanner,
    deleteBanner

};