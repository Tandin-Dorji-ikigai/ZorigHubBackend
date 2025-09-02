const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const ndiRoutes = require('./routes/ndi_routes');
const webhookRoutes = require('./routes/webhook_routes');
const googleAuthRoutes = require('./routes/googleAuth'); 
const loggedInUser= require('./routes/authRoutes');
const app = express();

app.use(express.json());

app.use(cors({
    origin: 'http://localhost:5317',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(cookieParser());
app.use('/api/artisanProducts', require('./routes/artisanProductRoutes'));
app.use('/api/artisans', require('./routes/userRoutes'));
app.use('/api/buyers', require('./routes/buyerRoutes'));
app.use('/api/admins', require('./routes/adminRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/carts', require('./routes/cartRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/metadata', require('./routes/metadataRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));

app.use('/api/auth', googleAuthRoutes);
app.use('/api/logged', loggedInUser);

app.use('/api/ndi', ndiRoutes);
app.use('/api/ndi', webhookRoutes);

module.exports = app;
