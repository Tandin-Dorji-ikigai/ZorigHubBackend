const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

router.get('/', OrderController.getAllOrders);
router.get('/:id', OrderController.getOrderById);
router.post('/', OrderController.createOrder);
router.get('/user/:userId', OrderController.getOrdersByUserId);
router.put('/:id/status', OrderController.updateOrderStatus);

module.exports = router;