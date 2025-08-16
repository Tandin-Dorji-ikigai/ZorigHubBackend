const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Get all transactions (with buyer and seller info)
router.get('/', transactionController.getAllTransactions);

// Get a single transaction by ID (with buyer and seller info)
router.get('/:id', transactionController.getTransactionById);

// Create a new transaction
router.post('/', transactionController.createTransaction);

module.exports = router;
