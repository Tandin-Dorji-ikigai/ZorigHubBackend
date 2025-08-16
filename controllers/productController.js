const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
// const AWS = require('aws-sdk');
// const multer = require('multer');
// const sharp = require('sharp');
// const multerS3 = require('multer-s3');

// Configure AWS S3
// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION
// });

// Multer S3 storage configuration for product images
// const upload = multer({ storage: multer.memoryStorage() });
// const upload = multer({ storage: multer.memoryStorage() });

// Middleware to use in routes for single product image upload
// exports.uploadProductImage = upload.single('image');
// exports.uploadProductImage = upload.single('image');

// Update product including S3 image update
// exports.updateProductWithImage = async (req, res) => {
//     try {
//         let imageUrl = null;
// exports.updateProductWithImage = async (req, res) => {
//     try {
//         let imageUrl = null;

//         // If a new image is uploaded, process and upload to S3
//         if (req.file) {
//             const processedBuffer = await sharp(req.file.buffer)
//                 .resize({ width: 800 })
//                 .jpeg({ quality: 80 })
//                 .toBuffer();
//         // If a new image is uploaded, process and upload to S3
//         if (req.file) {
//             const processedBuffer = await sharp(req.file.buffer)
//                 .resize({ width: 800 })
//                 .jpeg({ quality: 80 })
//                 .toBuffer();

//             const fileName = `product-images/${Date.now().toString()}-${req.file.originalname}`;
//             const uploadResult = await s3.upload({
//                 Bucket: process.env.AWS_S3_BUCKET_NAME,
//                 Key: fileName,
//                 Body: processedBuffer,
//                 ContentType: 'image/jpeg',
//                 // ACL: 'public-read'
//             }).promise();
//             const fileName = `product-images/${Date.now().toString()}-${req.file.originalname}`;
//             const uploadResult = await s3.upload({
//                 Bucket: process.env.AWS_S3_BUCKET_NAME,
//                 Key: fileName,
//                 Body: processedBuffer,
//                 ContentType: 'image/jpeg',
//                 // ACL: 'public-read'
//             }).promise();

//             imageUrl = uploadResult.Location;
//         }

//         const updateData = { ...req.body };
//         if (imageUrl) updateData.image = imageUrl;
//         const updateData = { ...req.body };
//         if (imageUrl) updateData.image = imageUrl;

//         // Log for debugging
//         console.log('updateData:', updateData);
//         // Log for debugging
//         console.log('updateData:', updateData);

//         const updatedProduct = await Product.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true }
//         );
//         if (!updatedProduct) {
//             return res.status(404).json({ error: 'Product not found' });
//         }
//         res.json(updatedProduct);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// };

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
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
        // if (!req.file) {
        //     return res.status(400).json({ error: 'Product image is required.' });
        // }
        // if (!req.file) {
        //     return res.status(400).json({ error: 'Product image is required.' });
        // }

        // const processedBuffer = await sharp(req.file.buffer)
        //     .resize({ width: 800 })
        //     .jpeg({ quality: 80 })
        //     .toBuffer();
        // const processedBuffer = await sharp(req.file.buffer)
        //     .resize({ width: 800 })
        //     .jpeg({ quality: 80 })
        //     .toBuffer();

        // const fileName = `product-images/${Date.now().toString()}-${req.file.originalname}`;
        // const uploadResult = await s3.upload({
        //     Bucket: process.env.AWS_S3_BUCKET_NAME,
        //     Key: fileName,
        //     Body: processedBuffer,
        //     ContentType: 'image/jpeg',
        //     // ACL: 'public-read'
        // }).promise();
        // const fileName = `product-images/${Date.now().toString()}-${req.file.originalname}`;
        // const uploadResult = await s3.upload({
        //     Bucket: process.env.AWS_S3_BUCKET_NAME,
        //     Key: fileName,
        //     Body: processedBuffer,
        //     ContentType: 'image/jpeg',
        //     // ACL: 'public-read'
        // }).promise();

        // const imageUrl = uploadResult.Location;
        // const productData = { ...req.body, image: imageUrl };
        // const imageUrl = uploadResult.Location;
        // const productData = { ...req.body, image: imageUrl };

        // Log for debugging
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
