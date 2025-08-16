const Transaction = require('../models/transactionModel');

/**
 * Get all transactions, populating buyer and seller info.
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('buyer', 'fullName email walletAddress')
            .populate('seller', 'fullName email walletAddress');
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get a single transaction by ID, populating buyer and seller info.
 */
exports.getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
            .populate('buyer', 'fullName email walletAddress')
            .populate('seller', 'fullName email walletAddress');
        if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
        res.json(transaction);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * Create a new transaction.
 * Expects: buyer, seller, txHash, amount in req.body
 */
exports.createTransaction = async (req, res) => {
    try {
        const { buyer, seller, txHash, amount } = req.body;
        if (!buyer || !seller || !txHash) {
            return res.status(400).json({ error: 'buyer, seller, and txHash are required' });
        }
        const transactionData = {
            buyer,
            seller,
            txHash,
            amount
        };
        const newTransaction = new Transaction(transactionData);
        await newTransaction.save();
        // Populate after save for response
        const populatedTransaction = await Transaction.findById(newTransaction._id)
            .populate('buyer', 'fullName email walletAddress')
            .populate('seller', 'fullName email walletAddress');
        res.status(201).json(populatedTransaction);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
