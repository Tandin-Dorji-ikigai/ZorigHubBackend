const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate({ path: 'categoryId', select: 'name description' }).lean();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate({
                path: 'userId',
                select: '_id fullName walletAddress'
            })
            .populate({
                path: 'categoryId',
                select: '_id name'
            });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {

        const productData = req.body;
        console.log('productData:', productData);

        const newProduct = new Product(productData);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err); // Log the full error
        res.status(400).json({ error: err.message, details: err.errors || err });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFeaturedProducts = async (req, res) => {
    try {
        // Find 4 products with the highest soldCount, only active products
        const featuredProducts = await Product.find({ isActive: true })
            .sort({ soldCount: -1 })
            .limit(4);
        res.json(featuredProducts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        // Get category from route params
        const category = req.params.category;
        if (!category) {
            return res.status(400).json({ error: 'Category is required in params' });
        }

        // Find the category document by name (case-insensitive)
        const categoryDoc = await Category.findOne({ name: new RegExp('^' + category + '$', 'i') });
        if (!categoryDoc) {
            return res.status(404).json({ error: 'Category not found' });
        }

        // Find products with this categoryId
        const products = await Product.find({ categoryId: categoryDoc._id, isActive: true });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getProductsByArtisan = async (req, res) => {
    try {
        const artisanId = req.params.artisanId;
        if (!artisanId) {
            return res.status(400).json({ error: 'Artisan ID is required in params' });
        }

        // Find products with this artisanId and are active
        const products = await Product.find({ userId: artisanId, isActive: true });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
