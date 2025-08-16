const express = require('express');
const router = express.Router();
const ArtisanProductController = require('../controllers/artisanProductController');

router.post('/', ArtisanProductController.createProduct);
router.get('/', ArtisanProductController.getAllProducts); // Optional

// Get product by ID (for pre-filling modal)
router.get('/:id', ArtisanProductController.getProductById);

// Update product
router.put('/:id', ArtisanProductController.updateProduct);
router.delete('/:id', ArtisanProductController.deleteProduct);

module.exports = router;


