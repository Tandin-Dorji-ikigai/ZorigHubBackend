const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel'); // if you want "create from cart"

const isObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const POPULATE = [
    { path: 'userId', select: 'fullName email' },
    { path: 'items.product', select: 'name price image images' },
    { path: 'items.seller', select: 'fullName dzongkhag gewog' },
    { path: 'transactionId', select: 'amount createdAt' }
];

// ---------- helpers ----------
async function buildItemsFromClient(items) {
    // items: [{ productId, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('items array is required');
    }

    const productIds = items.map(i => i.productId);
    if (!productIds.every(isObjectId)) throw new Error('Invalid productId in items');

    const products = await Product.find({ _id: { $in: productIds } })
        .select('_id price userId') // userId is artisan/seller on your Product model
        .lean();

    const byId = new Map(products.map(p => [String(p._id), p]));
    const built = items.map(i => {
        const prod = byId.get(String(i.productId));
        if (!prod) throw new Error(`Product not found: ${i.productId}`);

        const qty = Math.max(1, Number(i.quantity || 1));
        const price = Number(prod.price);
        if (!Number.isFinite(price)) throw new Error(`Invalid price for product: ${i.productId}`);

        return {
            product: prod._id,
            seller: prod.userId, // artisan reference from Product
            quantity: qty,
            price,
            subtotal: price * qty
        };
    });

    return built;
}

function computeTotal(items) {
    return items.reduce((sum, it) => sum + it.subtotal, 0);
}

// ---------- controllers ----------

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

/**
 * POST /api/orders
 * Body option A (direct):
 * {
 *   userId,
 *   items: [{ productId, quantity }, ...],
 *   transactionId? // optional at create time
 * }
 *
 * Body option B (from cart):
 * {
 *   userId,
 *   fromCart: true
 * }
 */
exports.createOrder = async (req, res) => {
    try {
        const { userId, transactionId, items, fromCart } = req.body;

        if (!userId) return res.status(400).json({ error: 'userId is required' });
        if (!isObjectId(userId)) return res.status(400).json({ error: 'Invalid userId' });
        if (transactionId && !isObjectId(transactionId)) {
            return res.status(400).json({ error: 'Invalid transactionId' });
        }

        let orderItems = [];

        if (fromCart) {
            // Build items from the user's cart
            const cart = await Cart.findOne({ userId }).populate('items.productId', '_id price userId').lean();
            if (!cart || !cart.items?.length) return res.status(400).json({ error: 'Cart is empty' });

            orderItems = cart.items.map(ci => {
                const p = ci.productId;
                if (!p) throw new Error('Malformed cart item (no product)');
                const qty = Math.max(1, Number(ci.quantity || 1));
                const price = Number(p.price);
                if (!Number.isFinite(price)) throw new Error(`Invalid price for product: ${p._id}`);
                return {
                    product: p._id,
                    seller: p.userId,
                    quantity: qty,
                    price,
                    subtotal: price * qty
                };
            });
        } else {
            // Build items from client-provided array
            orderItems = await buildItemsFromClient(items);
        }

        const totalAmount = computeTotal(orderItems);

        const doc = await Order.create({
            userId,
            items: orderItems,
            totalAmount,
            transactionId: transactionId || undefined, // optional
            status: 'pending'
        });

        // (Optional) If you want to clear the cart immediately for COD-style flow,
        // leave it for webhook if using an online payment gateway.
        // await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });

        const populated = await Order.findById(doc._id).populate(POPULATE).lean();
        return res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
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

// NOTE: in multi-seller orders, there is no top-level "seller" field.
// If you still want to filter by seller, query by 'items.seller'
exports.getOrdersBySellerId = async (req, res) => {
    try {
        const { sellerId } = req.params;
        if (!isObjectId(sellerId)) return res.status(400).json({ error: 'Invalid seller id' });

        const orders = await Order.find({ 'items.seller': sellerId }).populate(POPULATE).lean();
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
        const allowed = ['pending', 'paid', 'delivered', 'cancelled', 'failed'];
        if (!allowed.includes(status)) {
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
