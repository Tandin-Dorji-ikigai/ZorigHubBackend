// routes/paypal/paypal.js
const express = require('express');
const router = express.Router();
const PaypalController = require('../../controllers/paypal/paypal');


router.get("/payments/paypal/_debug", (req, res) => {
    const isLive = (process.env.PAYPAL_ENV || "sandbox").toLowerCase() === "live";
    res.json({
        env: isLive ? "live" : "sandbox",
        apiBase: isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
        clientIdPrefix: (process.env.PAYPAL_CLIENT_ID || "").slice(0, 8),
    });
});


// Frontend SDK bootstrap
router.get("/config/paypal", PaypalController.getPayPalClientId);

// Create / Capture
router.post("/payments/paypal/create-order", PaypalController.createPaypalOrder);
router.post("/payments/paypal/capture/:paypalOrderId", PaypalController.capturePaypalOrder);
module.exports = router;
