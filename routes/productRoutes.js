const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
// router.post('/', ProductController.uploadProductImage, ProductController.createProduct);
// router.put('/:id', ProductController.uploadProductImage, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);
router.get('/featured', ProductController.getFeaturedProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/artisan/:artisanId', ProductController.getProductsByArtisan);

module.exports = router;
