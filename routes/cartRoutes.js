const express = require('express');
const router = express.Router();
const CartController = require('../controllers/cartController');

router.get('/:userId', CartController.getUserCart);
router.post('/', CartController.createCart);
router.put('/:userId', CartController.updateCart);
router.post('/add-item', CartController.addItemToCart);
router.post('/remove-item', CartController.removeItemFromCart);
router.post('/empty/:userId', CartController.emptyCart);


module.exports = router;