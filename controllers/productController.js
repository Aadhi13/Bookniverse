const products = require("../models/productModel");
const categories = require("../models/categoryModel");
const { loadCategories } = require("./categoryController");

//To display product page in admin panel
const loadProducts = async (req, res) => {
    try {
        const productData = await products.find({}).populate('category').lean();
        res.render('products', { products: productData });
    } catch (error) {
        console.log(error.message);
    }
};

//To display new product adding page in admin panel
const loadNewProduct = async (req, res) => {
    try {
        const categoryData = await categories.find({});
        res.render('newProduct', { category: categoryData });
    } catch (error) {
        console.log(error.message);
    }
};

//To add new products to database
const addNewProduct = async (req, res) => {
    let imagePath = req.file.path;
    imagePath = imagePath.replace('public/', '');
    try {
        let product = new products(req.body);
        product.imagePath = imagePath;
        const productData = await product.save();
        if (productData) {
            res.redirect('/admin/products');
        } else {
            res.render('newProduct', { message: "Something went wrong..." });
        }
    } catch (error) {
        console.log(error.message);
    }
};

//To display product edit page in admin panel
const loadEditProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await products.findById({_id:id});
        const categoryData = await categories.find({});
        if(productData) {
            res.render('editProduct',{product: productData, category: categoryData});
        } else {
            res.redirect('admin/products');
        }
    } catch (error) {
        console.log(error.message);
    }
}

//To edit a existing product
const editProduct = async (req, res) => {
    try {
        const id = req.params.id;
        let {name, author, language, publisher, isbn, stock, mrp, srp, blockStatus, category, description} = req.body;
        let imagePath;
        if (req.file) {
            imagePath = req.file.path;
            imagePath = imagePath.replace('public/', '');
        } else {
            const productData = await products.findById({_id:id});
            imagePath = productData.imagePath;
        }
        await products.updateOne({_id:id},
            {
                $set: {
                    name: name,
                    author: author,
                    language: language,
                    publisher: publisher,
                    isbn: isbn,
                    stock: stock,
                    mrp: mrp,
                    srp: srp,
                    blockStatus: blockStatus,
                    category: category,
                    description: description,
                    imagePath: imagePath
                }
            });
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
    }
}

//To manage disable/enable status of product
const productStatus = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await products.findById({_id:id});
        if(productData.blockStatus == 1) {
            productData.blockStatus = 0
            await productData.save();
        } else {
            productData.blockStatus = 1
            await productData.save();
        }
        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loadProducts,
    loadNewProduct,
    addNewProduct,
    loadEditProduct,
    productStatus,
    editProduct
}