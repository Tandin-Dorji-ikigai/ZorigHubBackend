// controllers/transactionController.js
const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const Order = require('../models/orderModel');

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const POPULATE = [
    { path: 'buyer', select: 'fullName email' },
    { path: 'seller', select: 'fullName email' },
    {
        path: 'order',
        select: 'totalAmount status items userId createdAt',
        populate: [
            { path: 'items.product', select: 'name price image images' },
            { path: 'items.seller', select: 'fullName' },
        ],
    },
];

// GET /api/transactions
exports.getAllTransactions = async (_req, res) => {
    try {
        const txns = await Transaction.find().sort({ createdAt: -1 }).populate(POPULATE).lean();
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/transactions/:id
exports.getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid transaction id' });

        const txn = await Transaction.findById(id).populate(POPULATE).lean();
        if (!txn) return res.status(404).json({ error: 'Transaction not found' });
        res.json(txn);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/**
 * POST /api/transactions
 * Body can be:
 *  A) { order, seller?, amount?, method?, provider?, providerTxnId?, currency?, status?, breakdown?, idempotencyKey?, notes?, metadata? }
 *     - When the order has ONE seller, `seller` can be omitted; amount defaults to order.totalAmount.
 *     - When the order has MULTIPLE sellers, `seller` is required; amount defaults to sum of that seller's item subtotals.
 *
 *  B) { buyer, seller, amount, method?, provider?, providerTxnId?, currency?, status?, breakdown?, idempotencyKey?, notes?, metadata? }
 */
exports.createTransaction = async (req, res) => {
    try {
        const {
            order,
            seller,
            buyer,
            amount,
            currency = 'BTN',
            status,                  // 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'cancelled'
            method = 'other',
            provider,
            providerTxnId,
            breakdown,
            idempotencyKey,
            notes,
            metadata,
        } = req.body;

        // Idempotency: return existing if present
        if (idempotencyKey) {
            const existing = await Transaction.findOne({ idempotencyKey }).populate(POPULATE).lean();
            if (existing) return res.status(200).json(existing);
        }

        const doc = {
            currency: String(currency).toUpperCase(),
            status: status || 'captured',
            method,
            provider,
            providerTxnId,
            breakdown,
            idempotencyKey,
            notes,
            metadata,
        };

        if (order) {
            if (!isObjectId(order)) return res.status(400).json({ error: 'Invalid order id' });
            const o = await Order.findById(order).lean();
            if (!o) return res.status(404).json({ error: 'Order not found' });

            doc.order = o._id;
            doc.buyer = o.userId;

            // Collect seller ids from items
            const sellers = Array.from(new Set((o.items || []).map((i) => String(i.seller))));
            if (sellers.length === 0) return res.status(400).json({ error: 'Order has no sellers' });

            if (sellers.length === 1) {
                // single-seller order
                doc.seller = sellers[0];
                doc.amount = Number.isFinite(+amount) ? +amount : Number(o.totalAmount) || 0;
            } else {
                // multi-seller — require seller param
                if (!seller) return res.status(400).json({ error: 'Order has multiple sellers; provide `seller` in body' });
                if (!isObjectId(seller)) return res.status(400).json({ error: 'Invalid seller id' });
                if (!sellers.includes(String(seller))) {
                    return res.status(400).json({ error: 'Seller not part of this order' });
                }

                doc.seller = seller;

                // default amount = sum of that seller's items
                const computed = (o.items || [])
                    .filter((i) => String(i.seller) === String(seller))
                    .reduce((sum, i) => sum + Number(i.subtotal || 0), 0);

                doc.amount = Number.isFinite(+amount) ? +amount : computed;
            }
        } else {
            // raw transaction (no order)
            const missing = [];
            if (!buyer) missing.push('buyer');
            if (!seller) missing.push('seller');
            if (amount == null) missing.push('amount');
            if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

            if (![buyer, seller].every(isObjectId)) {
                return res.status(400).json({ error: 'Invalid buyer or seller id' });
            }

            doc.buyer = buyer;
            doc.seller = seller;
            doc.amount = Number(amount);
            if (!Number.isFinite(doc.amount) || doc.amount < 0) {
                return res.status(400).json({ error: 'Invalid amount' });
            }
        }

        // Lifecycle timestamps
        const now = new Date();
        if (doc.status === 'authorized') doc.authorizedAt = now;
        if (doc.status === 'captured') doc.capturedAt = now;
        if (doc.status === 'failed') doc.failedAt = now;

        const created = await Transaction.create(doc);
        const populated = await Transaction.findById(created._id).populate(POPULATE).lean();
        return res.status(201).json(populated);
    } catch (err) {
        const code = err?.name === 'ValidationError' ? 400 : 400;
        res.status(code).json({ error: err.message });
    }
};

// GET /api/transactions/buyer/:buyerId
exports.getTransactionsByBuyer = async (req, res) => {
    try {
        const { buyerId } = req.params;
        if (!isObjectId(buyerId)) return res.status(400).json({ error: 'Invalid buyer id' });
        const txns = await Transaction.find({ buyer: buyerId }).sort({ createdAt: -1 }).populate(POPULATE).lean();
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/transactions/seller/:sellerId
exports.getTransactionsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!isObjectId(sellerId)) return res.status(400).json({ error: 'Invalid seller id' });
        const txns = await Transaction.find({ seller: sellerId }).sort({ createdAt: -1 }).populate(POPULATE).lean();
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/transactions/order/:orderId
exports.getTransactionsByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!isObjectId(orderId)) return res.status(400).json({ error: 'Invalid order id' });
        const txns = await Transaction.find({ order: orderId }).sort({ createdAt: -1 }).populate(POPULATE).lean();
        res.json(txns);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/transactions/:id/status
exports.updateTransactionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid transaction id' });

        const { status } = req.body;
        const allowed = ['pending', 'authorized', 'captured', 'failed', 'refunded', 'cancelled'];
        if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status value' });

        const set = { status };
        const now = new Date();
        if (status === 'authorized') set.authorizedAt = now;
        if (status === 'captured') set.capturedAt = now;
        if (status === 'failed') set.failedAt = now;
        if (status === 'refunded') set.refundedAt = now;

        const updated = await Transaction.findByIdAndUpdate(
            id,
            { $set: set },
            { new: true, runValidators: true }
        ).populate(POPULATE).lean();

        if (!updated) return res.status(404).json({ error: 'Transaction not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// POST /api/transactions/:id/refunds
exports.addRefund = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid transaction id' });

        const { amount, reason, note } = req.body;
        const amt = Number(amount);
        if (!Number.isFinite(amt) || amt < 0) {
            return res.status(400).json({ error: 'Invalid refund amount' });
        }

        const updated = await Transaction.findByIdAndUpdate(
            id,
            {
                $push: { refunds: { amount: amt, reason, note, createdAt: new Date() } },
                $set: { status: 'refunded', refundedAt: new Date() },
            },
            { new: true, runValidators: true }
        ).populate(POPULATE).lean();

        if (!updated) return res.status(404).json({ error: 'Transaction not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
