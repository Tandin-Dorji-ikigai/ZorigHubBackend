// controllers/orderController.js
const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel'); // used to compute total from price

const POPULATE = [
    { path: 'userId', select: 'fullName email' },
    { path: 'seller', select: 'fullName dzongkhag gewog' },
    { path: 'productId', select: 'name price image images' },
    { path: 'transactionId', select: ' amount createdAt' },
];

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate(POPULATE).lean();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid order id' });

        const order = await Order.findById(id).populate(POPULATE).lean();
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/orders
exports.createOrder = async (req, res) => {
    try {
        const { userId, productId, transactionId, seller, quantity = 1, status } = req.body;

        // Required fields
        const missing = [];
        if (!userId) missing.push('userId');
        if (!productId) missing.push('productId');
        if (!transactionId) missing.push('transactionId');
        if (!seller) missing.push('seller');
        if (missing.length) return res.status(400).json({ error: `Missing: ${missing.join(', ')}` });

        // ObjectId validation
        if (![userId, productId, transactionId, seller].every(isObjectId)) {
            return res.status(400).json({ error: 'Invalid object id(s) provided' });
        }

        // Status validation (optional on create)
        if (status && !['pending', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Compute total server-side
        const product = await Product.findById(productId).lean();
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const qty = Math.max(1, Number(quantity) || 1);
        const unitPrice = Number(product.price);
        if (Number.isNaN(unitPrice)) {
            return res.status(400).json({ error: 'Product price is invalid or missing' });
        }
        const totalAmount = unitPrice * qty;

        const doc = await Order.create({
            userId,
            productId,
            transactionId,
            seller,
            quantity: qty,
            totalAmount,
            status: status || 'pending',
        });

        const populated = await Order.findById(doc._id).populate(POPULATE).lean();
        return res.status(201).json(populated);
    } catch (err) {
        const code = err?.name === 'ValidationError' ? 400 : 400;
        res.status(code).json({ error: err.message });
    }
};

// GET /api/orders/user/:userId
exports.getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!isObjectId(userId)) return res.status(400).json({ error: 'Invalid user id' });

        const orders = await Order.find({ userId }).populate(POPULATE).lean();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/orders/seller/:sellerId
exports.getOrdersBySellerId = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!isObjectId(sellerId)) return res.status(400).json({ error: 'Invalid seller id' });

        const orders = await Order.find({ seller: sellerId }).populate(POPULATE).lean();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        if (!isObjectId(id)) return res.status(400).json({ error: 'Invalid order id' });

        const { status } = req.body;
        if (!['pending', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        const updated = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        ).populate(POPULATE).lean();

        if (!updated) return res.status(404).json({ error: 'Order not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
