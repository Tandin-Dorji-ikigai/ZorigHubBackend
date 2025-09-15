// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getAllTransactions);
router.get('/:id', transactionController.getTransactionById);
router.get('/buyer/:buyerId', transactionController.getTransactionsByBuyer);
router.get('/seller/:sellerId', transactionController.getTransactionsBySeller);
router.get('/order/:orderId', transactionController.getTransactionsByOrder);

router.post('/', transactionController.createTransaction);
router.patch('/:id/status', transactionController.updateTransactionStatus);
router.post('/:id/refunds', transactionController.addRefund);

module.exports = router;
