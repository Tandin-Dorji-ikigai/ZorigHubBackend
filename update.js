const mongoose = require('mongoose');
const Product = require('./models/productModel'); // Path to your product model

mongoose.connect('mongodb+srv://zorighub:zorighub123@zorighub.fkxrhgt.mongodb.net/?', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log('Connected to MongoDB');

        // Update all products that don't have the `featured` field
        const result = await Product.updateMany(
            { featured: { $exists: false } }, // Filter products that don't have `featured`
            { $set: { featured: false } } // Set `featured` to false for those products
        );
        console.log(`${result.nModified} products were updated with featured: false`);

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
