// routes/googleSign.js
const { Client, Account, OAuthProvider } = require('node-appwrite');  // Use require
const express = require("express");
require('dotenv').config();  // Use require for dotenv

const router = express.Router();

// Create Appwrite Client
const createAppwriteClient = async (type, session) => {
    const { ENDPOINT, PROJECT_ID, API_KEY } = process.env;

    const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

    if (type === "admin") {
        client.setKey(API_KEY);
    }
    if (type === "session" && session) {
        client.setSession(session);
    }

    return {
        get account() {
            return new Account(client);
        },
    };
};

// Route to initiate Google OAuth login
router.get("/auth", async (req, res) => {
    try {
        const { account } = await createAppwriteClient("admin");

        // Generate the OAuth2 URL for Google
        const redirectUrl = await account.createOAuth2Token(
            OAuthProvider.Google,
            "http://localhost:5173/success",  // Success URL
            "http://localhost:5173/fail"      // Failure URL
        );

        const button = `<button><a href=${redirectUrl}>Sign in with Google</a></button>`;
        res.set("Content-Type", "text/html");
        return res.send(button);
    } catch (error) {
        console.error("OAuth error:", error);  // Log the error for debugging
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Route to handle the OAuth2 success and session creation
router.get("/success", async (req, res) => {
    try {
        const { userId, secret } = req.query;
        const { account } = await createAppwriteClient("admin");

        const session = await account.createSession(userId, secret);

        res.cookie("session", session.secret, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: new Date(session.expire),
            path: "/"
        });

        res.send("Session successfully set");
    } catch (error) {
        console.error("OAuth success error:", error);  // Log the error for debugging
        return res.status(500).json({ error: error.message, stack: error.stack });
    }
});


// Route to fetch user info from the session cookie
router.get("/user", async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.send("You are not authenticated, please log in first!");
        }

        const { account } = await createAppwriteClient("session", sessionCookie);
        const user = await account.get();

        return res.json({ user });
    } catch (error) {
        return res.json({ error });
    }
});

module.exports = router; 
