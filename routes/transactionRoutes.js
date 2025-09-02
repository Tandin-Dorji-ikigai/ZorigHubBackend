// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/transactionController');

router.get('/', ctrl.getAllTransactions);
router.get('/:id', ctrl.getTransactionById);
router.get('/buyer/:buyerId', ctrl.getTransactionsByBuyer);
router.get('/seller/:sellerId', ctrl.getTransactionsBySeller);
router.get('/order/:orderId', ctrl.getTransactionsByOrder);

router.post('/', ctrl.createTransaction);
router.patch('/:id/status', ctrl.updateTransactionStatus);
router.post('/:id/refunds', ctrl.addRefund);

module.exports = router;
