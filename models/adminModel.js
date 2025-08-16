const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    walletAddress: { type: String, unique: true, required: true },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    photo: { type: String, default: "https://static.thenounproject.com/png/4530368-200.png" } // URL to the user's photo stored in AWS S3
});

module.exports = mongoose.model('Admin', adminSchema);