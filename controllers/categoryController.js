const { default: mongoose } = require("mongoose");
const category = require("../models/categoryModel");
const product = require("../models/productModel");

//To display admin categories page
const loadCategories = async (req, res) => {
    try {
        const categoryData = await category.find({});
        res.render('categories', {categories:categoryData});
    } catch (error) {
        console.log(error.message);
    }
};

//To add new category 
const addCategory = async (req, res) => {
    try {
        let imagePath = req.file.path;
        imagePath = imagePath.replace('public/', '');
        const product = new category({
            name:req.body.name,
            imagePath: imagePath,
            blockStatus:0
        })

        const categoryData = await product.save();

        if(categoryData) {
            res.redirect('/admin/categories')
        } else {
            // res.render('')
        }
    } catch(error) {
        console.log(error.message);
    }
};

//To display category edit page in admin panel
const loadEditCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await category.findById({_id:id});
        if (categoryData) {
            res.render('editCategory', {category: categoryData});
        } else {
            console.log('Someting went wrong with edit category page displaying');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To edit category
const editCategory = async (req, res) => {
    try {
        const id = req.params.id;
        let {name, blockStatus} = req.body;
        let imagePath;
        if (req.file) {
            imagePath = req.file.path;
            imagePath = imagePath.replace('public/', '');
        } else {
            const categoryData = await category.findById({_id:id});
            imagePath = categoryData.imagePath;
        }
        await category.updateOne({_id:id},
            {
                $set: {
                    name: name,
                    imagePath: imagePath,
                    blockStatus: blockStatus
                }
            });
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error.message);
    }
};

//To manage category block status
const categoryStatus = async (req, res) => {
    try {
        let id = req.query.id;
        const productData = await product.find({category:id})
        const categoryData = await category.findById(id);
        if(categoryData.blockStatus == 1) {
            await category.findByIdAndUpdate(id,{$set:{blockStatus:0}});
            await product.updateMany({category:id},{$set:{categoryBlockStatus:0}});
        } else {
            await category.findByIdAndUpdate(id,{$set:{blockStatus:1}});
            await product.updateMany({category:id},{$set:{categoryBlockStatus:1}});
        }
        res.redirect('/admin/categories');
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    loadCategories,
    addCategory,
    categoryStatus,
    loadEditCategory,
    editCategory
}