const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
    totalAmount: Number,
    createdAt: { type: Date, default: Date.now },
    status: {
        type: String,
        enum: ['pending', 'delivered', 'cancelled'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Order', orderSchema);