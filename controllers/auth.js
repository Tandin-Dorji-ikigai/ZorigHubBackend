// middleware/auth.js
const jwt = require("jsonwebtoken");
const { createAppwriteClient } = require("../controllers/google/appwrite"); 
const Buyer = require("../models/buyerModel");

async function auth(req, res, next) {
    try {
        // 1) Internal JWT cookie
        const token = req.cookies?.auth_token;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || "this-is-secret-value-for-now");
                req.user = {
                    source: "jwt",
                    id: decoded.userId,
                    email: decoded.email,
                    name: decoded.username || decoded.name,
                    role: decoded.role || "buyer",
                };
                return next();
            } catch (err) {
                console.warn("Invalid internal JWT cookie:", err.message);
            }
        }

        // 2) Appwrite session cookie
        const sessionCookie = req.cookies?.session;
        if (sessionCookie) {
            try {
                const { account } = await createAppwriteClient("session", sessionCookie);
                const appwriteUser = await account.get();

                const buyer =
                    (await Buyer.findOne({ email: appwriteUser.email })) ||
                    (await Buyer.findOne({ walletAddress: appwriteUser.$id }));

                req.user = {
                    source: "appwrite",
                    id: buyer?._id || appwriteUser.$id,
                    email: buyer?.email || appwriteUser.email,
                    name: buyer?.fullName || appwriteUser.name,
                    role: buyer?.role || "buyer",
                    avatar:
                        buyer?.photo ||
                        appwriteUser?.prefs?.photo ||
                        "https://static.thenounproject.com/png/4530368-200.png",
                };
                return next();
            } catch (err) {
                console.warn("Invalid Appwrite session:", err.message);
            }
        }

        return res.status(401).json({ error: "Not authenticated" });
    } catch (e) {
        console.error("auth middleware error:", e);
        return res.status(500).json({ error: "Internal server error" });
    }
}

async function logout(req, res) {
  try {
    // Clear internal JWT cookie if present
    const hadJwt = Boolean(req.cookies?.auth_token);
    if (hadJwt) {
      res.cookie("auth_token", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // set true in HTTPS
        path: "/",
        expires: new Date(0),
      });
    }

    // Invalidate Appwrite session if present
    const sessionCookie = req.cookies?.session;
    if (sessionCookie) {
      try {
        const { account } = await createAppwriteClient("session", sessionCookie);
        // delete the *current* session bound to the cookie
        await account.deleteSession("current");
      } catch (e) {
        // If cookie is invalid/expired, ignore
        console.warn("Appwrite deleteSession error:", e?.message || e);
      }

      // Clear session cookie
      res.cookie("session", "", {
        httpOnly: true,
        sameSite: "lax",
        secure: false, // true in HTTPS
        path: "/",
        expires: new Date(0),
      });
    }

    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (e) {
    console.error("logout error:", e);
    return res.status(500).json({ error: "Failed to logout" });
  }
}

module.exports = { auth, logout };