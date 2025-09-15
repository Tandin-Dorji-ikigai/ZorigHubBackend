const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');

// Put the specific routes BEFORE the /:id route
router.get('/user/:userId', ctrl.getOrdersByUserId);
router.get('/seller/:sellerId', ctrl.getOrdersBySellerId);

router.get('/', ctrl.getAllOrders);
router.get('/:id', ctrl.getOrderById);
router.post('/', ctrl.createOrder);
router.patch('/:id/status', ctrl.updateOrderStatus);

module.exports = router;
