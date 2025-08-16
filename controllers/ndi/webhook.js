// controllers/webhook.js
const axios = require("axios");
const getAccessToken = require("../../middleware/auth_ndi");

const WEBHOOK_ID = "webhookDemo11";
const WEBHOOK_URL = "https://0668-103-197-177-137.ngrok-free.app/api/ndi/webhook";
const FIXED_ACCESS_TOKEN = "my-access-token-123";

// Register webhook once
const registerWebhook = async (req, res) => {
    try {
        const token = await getAccessToken();
        console.log(WEBHOOK_ID)
        const response = await axios.post(
            "https://demo-client.bhutanndi.com/webhook/v1/register",
            {
                webhookId: WEBHOOK_ID,
                webhookURL: WEBHOOK_URL,
                authentication: {
                    type: "OAuth2",
                    version: "v2",
                    data: {
                        token: FIXED_ACCESS_TOKEN,
                    },
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(201).json({
            message: "Webhook registered successfully",
            data: response.data.data,
        });
    } catch (error) {
        console.error("Webhook registration failed:", error.response?.data || error.message);
        res.status(500).json({ error: "Webhook registration failed" });
    }
};

// Subscribe to a thread ID (e.g., proofRequestThreadId)
const subscribeWebhook = async (req, res) => {
    const { threadId } = req.body;
    if (!threadId) return res.status(400).json({ error: "Missing threadId" });

    try {
        const token = await getAccessToken();

        const response = await axios.post(
            "https://demo-client.bhutanndi.com/webhook/v1/subscribe",
            {
                webhookId: WEBHOOK_ID,
                threadId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(202).json({
            message: "Webhook subscribed",
            data: response.data.data,
        });
    } catch (error) {
        console.error("Webhook subscribe failed:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to subscribe to webhook" });
    }
};

// Unsubscribe from a thread ID
const unsubscribeWebhook = async (req, res) => {
    const { threadId } = req.body;
    if (!threadId) return res.status(400).json({ error: "Missing threadId" });

    try {
        const token = await getAccessToken();

        const response = await axios.post(
            "https://demo-client.bhutanndi.com/webhook/v1/unsubscribe",
            { threadId },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json({
            message: "Webhook unsubscribed",
            data: response.data.data,
        });
    } catch (error) {
        console.error("Webhook unsubscribe failed:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to unsubscribe from webhook" });
    }
};

module.exports = {
    registerWebhook,
    subscribeWebhook,
    unsubscribeWebhook,
};
