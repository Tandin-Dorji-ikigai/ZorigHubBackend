// controllers/paypal/paypal.js
// If your orderModel is ESM-exported, the `.default ||` fallback handles it.
const _Order = require("../../models/orderModel");
const Order = _Order?.default || _Order;

const isLive = (process.env.PAYPAL_ENV || "sandbox").toLowerCase() === "live";
const PAYPAL_API_BASE = isLive
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";

async function getAccessToken() {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const resp = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
    });

    if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`PayPal token error: ${resp.status} ${errText}`);
    }
    const data = await resp.json();
    return data.access_token;
}

function computeTotalsFromOrder(orderDoc) {
    const items = (orderDoc?.items || []).map((it) => ({
        price: Number(it.price || 0),
        quantity: Number(it.quantity || it.qty || 1),
    }));
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    const shipping = 5; // example
    const tax = Math.round(subtotal * 0.1 * 100) / 100;
    const total = Math.round((subtotal + shipping + tax) * 100) / 100;
    return { subtotal, shipping, tax, total, currency_code: "USD" };
}

// --- Controllers ---
async function getPayPalClientId(req, res) {
    try {
        return res.json(CLIENT_ID);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to return client id" });
    }
}

async function createPaypalOrder(req, res) {
    try {
        const { orderId } = req.body || {};
        if (!orderId) return res.status(400).json({ error: "orderId required" });

        const orderDoc = await Order.findById(orderId).lean();
        if (!orderDoc) return res.status(404).json({ error: "Order not found" });
        if ((orderDoc.status || "").toLowerCase() !== "pending") {
            return res.status(400).json({ error: `Order is ${orderDoc.status}, cannot pay` });
        }

        const { total, currency_code } = computeTotalsFromOrder(orderDoc);
        const accessToken = await getAccessToken();

        const body = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: String(orderDoc._id),
                    amount: { currency_code, value: total.toFixed(2) },
                },
            ],
            application_context: {
                brand_name: "ZorigHub",
                user_action: "PAY_NOW",
                shipping_preference: "NO_SHIPPING",
            },
        };

        const resp = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
        });

        const data = await resp.json();
        if (!resp.ok) {
            console.error("PayPal create order failed", data);
            return res.status(resp.status).json(data);
        }

        // Optionally persist mapping: orderDoc._id <-> data.id
        // await Order.updateOne({ _id: orderDoc._id }, { $set: { paypalOrderId: data.id } });

        return res.json({ id: data.id });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to create PayPal order" });
    }
}

async function capturePaypalOrder(req, res) {
    try {
        const { paypalOrderId } = req.params;
        if (!paypalOrderId) return res.status(400).json({ error: "paypalOrderId required" });

        const accessToken = await getAccessToken();

        const resp = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        const data = await resp.json();

        if (!resp.ok) {
            console.error("PayPal capture failed", data);
            return res.status(resp.status).json(data);
        }

        const status = data.status; // "COMPLETED"
        const ref = data?.purchase_units?.[0]?.reference_id; // our order _id
        if (status === "COMPLETED" && ref) {
            try {
                await Order.updateOne(
                    { _id: ref },
                    { $set: { status: "paid", "payments.paypal.capture": data } }
                );
            } catch (e) {
                console.error("Failed to mark order paid", e);
            }
        }

        return res.json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ error: "Failed to capture PayPal order" });
    }
}

module.exports = {
    getPayPalClientId,
    createPaypalOrder,
    capturePaypalOrder,
};
