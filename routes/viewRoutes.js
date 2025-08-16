const express = require('express');
const path = require('path');
// const authenticateToken = require('../middleware/authenticateToken');
// const authorizeRole = require('../middleware/authorizeRole');

const router = express.Router();

// router.get('/home', authenticateToken, (req, res) => {
//     res.sendFile(path.join(__dirname, '../protected/home.html'));
// });

// router.get('/admin', authenticateToken, authorizeRole('admin'), (req, res) => {
//     res.sendFile(path.join(__dirname, '../protected/admin.html'));
// });


router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/accounttype", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/signup.html"));
});

router.get("/ndi", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/ndiLogin.html"));
});

router.get("/adminLogin", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/adminLogin.html"));
});

router.get("/google-success", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/google-success.html"));
});


// ARTISANS
router.get('/artisan', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/artisans/index.html'));
});

router.get('/artisan/earnings', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/artisans/earnings.html'));
});

router.get('/artisan/products', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/artisans/products.html'));
});

router.get('/artisan/orders', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/artisans/orders.html'));
});

router.get('/artisan/profile', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/artisans/profile.html'));
});

// BUYERS
router.get('/buyer', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/index.html'));
});

router.get('/buyer/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/about.html'));
});

router.get('/buyer/artisans', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/artisans.html'));
});

router.get('/buyer/cart', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/cart.html'));
});

router.get('/buyer/marketplace', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/marketplace.html'));
});

router.get('/buyer/productDetails', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/productDetails.html'));
});

router.get('/buyer/buyerProfile', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/buyerProfile.html'));
});

router.get('/buyer/artisanProfile', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/artisanProfile.html'));
});

router.get('/buyer/orders', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/buyers/orders.html'));
});


// ADMIN
router.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/admins/index.html'));
});

router.get('/admin/adminanalytics', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/admins/adminanalytics.html'));
});

router.get('/admin/adminloan', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/admins/adminloan.html'));
});

router.get('/admin/adminsettings', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/admins/adminsettings.html'));
});

router.get('/admin/adminuser', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/admins/adminuser.html'));
});

router.get('/admin/adminorders', (req, res) => {
    res.sendFile(path.join(__dirname, '../protected/admins/adminorders.html'));
});

module.exports = router;
