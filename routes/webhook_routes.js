const express = require("express");
const jwt = require("jsonwebtoken");
const {
    registerWebhook,
    subscribeWebhook,
    unsubscribeWebhook,
} = require("../controllers/ndi/webhook");

const User = require("../models/userModel");
const router = express.Router();

let userDataStore = {};

// ✅ Webhook endpoint for Bhutan NDI
router.post("/webhook", async (req, res) => {
    const payload = req.body;
    console.log("📩 Raw Webhook Payload:", JSON.stringify(payload, null, 2));

    const { type, verification_result, requested_presentation } = payload;

    if (type === "present-proof/presentation-result" && verification_result === "ProofValidated") {
        const revealed = requested_presentation?.revealed_attrs;

        // ✅ Extract verified user data (but NOT walletAddress)
        const userData = {
            CID: revealed?.["ID Number"]?.[0]?.value,
            fullName: revealed?.["Full Name"]?.[0]?.value,
            gender: revealed?.["Gender"]?.[0]?.value,
            village: revealed?.["Village"]?.[0]?.value,
            gewog: revealed?.["Gewog"]?.[0]?.value,
            dzongkhag: revealed?.["Dzongkhag"]?.[0]?.value,
            // ✅ Removed walletAddress from here (MetaMask will override later)
        };

        if (!userData.CID) {
            console.warn("⚠️ CID is missing — cannot register user.");
            return res.sendStatus(202);
        }

        try {
            let user = await User.findOne({ CID: userData.CID });

            if (!user) {
                user = await User.create({
                    fullName: userData.fullName,
                    gender: userData.gender,
                    CID: userData.CID,
                    dzongkhag: userData.dzongkhag,
                    gewog: userData.gewog,
                    walletAddress: "abdDummyAddress123", // 👈 placeholder
                    isActive: true,
                });
                console.log("✅ Registered new user:", user.fullName);
            } else {
                console.log("ℹ️ User already exists:", user.fullName);
            }

            // 🔐 Generate login token
            const token = jwt.sign(
                { userId: user._id, CID: user.CID },
                process.env.JWT_SECRET || "this-is-secret-value-for-now",
                { expiresIn: "2h" }
            );

            // ✅ Store minimal session in memory (used by frontend)
            userDataStore = {
                [user.CID]: {
                    ...userData,
                    _id: user._id,
                    fullName: user.fullName,
                    token,
                    walletAddress: user.walletAddress, // Use value from DB
                }
            };

        } catch (err) {
            console.error("❌ Failed to save user or generate token:", err.message);
        }
    }

    res.sendStatus(202);
});

// ✅ Webhook polling (used by frontend QR poll)
router.get("/webhook", (req, res) => {
    const users = Object.values(userDataStore);

    if (users.length === 0) {
        return res.status(200).json({
            message: "⏳ Waiting for NDI scan...",
            data: [],
        });
    }

    return res.status(200).json({
        message: "✅ User authenticated via NDI",
        data: users,
    });
});

// ✅ Logout (clears memory + cookies)
router.post("/logout", (req, res) => {
    userDataStore = {};
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    res.clearCookie("cid", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });
    return res.redirect("/");
});

// ✅ Bhutan NDI webhook management
router.post("/webhook/register", registerWebhook);
router.post("/webhook/subscribe", subscribeWebhook);
router.post("/webhook/unsubscribe", unsubscribeWebhook);

module.exports = router;
