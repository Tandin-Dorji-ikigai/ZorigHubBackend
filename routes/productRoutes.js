const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');


router.get('/featured', ProductController.getFeaturedProducts);
router.get('/category/:category', ProductController.getProductsByCategory);
router.get('/artisan/:artisanId', ProductController.getProductsByArtisan);

router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);
router.post('/', ProductController.createProduct);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);



module.exports = router;
