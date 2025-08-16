const Cart = require('../models/cartModel');

exports.getUserCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.userId })
        .populate('items.productId');
        res.json(cart);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createCart = async (req, res) => {
    try {
        const newCart = new Cart(req.body);
        await newCart.save();
        res.status(201).json(newCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateCart = async (req, res) => {
    try {
        const updatedCart = await Cart.findOneAndUpdate(
            { userId: req.params.userId },
            req.body,
            { new: true }
        );
        if (!updatedCart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        res.json(updatedCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.addItemToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, price } = req.body;
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        await cart.addItem(productId, quantity, price);
        const updatedCart = await Cart.findOne({ userId });
        res.status(200).json(updatedCart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.removeItemFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        cart.items = cart.items.filter(item => !item.productId.equals(productId));
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.emptyCart = async (req, res) => {
    try {
        const { userId } = req.params;
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }
        cart.items = [];
        await cart.save();
        res.status(200).json(cart);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};