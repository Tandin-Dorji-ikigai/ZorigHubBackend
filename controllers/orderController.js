const Order = require('../models/orderModel');

exports.getAllOrders = async (req, res) => {
    try {
        // Populate userId, productId, and transactionId for richer order info
        const orders = await Order.find()
            .populate('userId', 'fullName email walletAddress')
            .populate('productId', 'name price image')
            .populate('transactionId', 'txHash amount createdAt');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('userId', 'fullName email walletAddress')
            .populate('productId', 'name price image')
            .populate('transactionId', 'txHash amount createdAt');
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        // Only allow fields defined in the model
        const { userId, productId, transactionId, totalAmount, status } = req.body;
        if (!productId) {
            return res.status(400).json({ error: 'productId is required' });
        }
        const orderData = {
            userId,
            productId,
            transactionId,
            totalAmount,
            status
        };
        const newOrder = new Order(orderData);
        await newOrder.save();
        // Populate after save for response
        const populatedOrder = await Order.findById(newOrder._id)
            .populate('userId', 'fullName email walletAddress')
            .populate('productId', 'name price image')
            .populate('transactionId', 'txHash amount createdAt');
        res.status(201).json(populatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getOrdersByUserId = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('userId', 'fullName email walletAddress')
            .populate('productId', 'name price image')
            .populate('transactionId', 'txHash amount createdAt');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        // Only allow valid status values
        if (!['pending', 'delivered', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}