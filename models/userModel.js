const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName: { type: String, required: true },
    artisanDescription: { type: String },
    createdAt: { type: Date, default: Date.now },
    gender: { type: String },
    CID: { type: String, unique: true },
    gewog: { type: String },
    dzongkhag: { type: String },
    isActive: { type: Boolean, default: true },
    photo: { type: String, default: "https://static.thenounproject.com/png/4530368-200.png" } // URL to the user's photo stored in AWS S3
});

module.exports = mongoose.model('Artisan', userSchema);