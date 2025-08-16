const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'Artisan', required: true },
    txHash: { type: String, unique: true, required: true },
    amount: Number,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);