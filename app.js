const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const { createAppwriteClient } = require("./appwrite.js");
const { OAuthProvider } = require("node-appwrite");
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const viewRoutes = require('./routes/viewRoutes');
const ndiRoutes = require("./routes/ndi_routes")
const webhookRoutes = require('./routes/webhook_routes');
const googleRoute = require("./routes/googleSign")
const app = express();
const router = express.Router();
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const Buyer = require("./models/buyerModel.js")
const jwt = require("jsonwebtoken");
// app.use('/api/auth', require('./routes/authRoutes'));
app.use("/api/artisanProducts", require("./routes/artisanProductRoutes"));
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
app.use('/', require('./routes/viewRoutes'));

app.use('/api/auth', authRoutes);
app.use('/', viewRoutes);
app.use('/api/google', googleRoute)

//ndi routes
app.use("/api/ndi", ndiRoutes);
app.use("/api/ndi", webhookRoutes);

app.get("/api/auth/google/start", async (req, res) => {
    try {
        const { account } = await createAppwriteClient("admin")
        console.log(account);

        const redirectUrl = await account.createOAuth2Token(
            OAuthProvider.Google,
            "http://localhost:5173/api/auth/google/success",
            "http://localhost:5173/api/auth/google/fail"
        );
        console.log(redirectUrl);

        if (!redirectUrl) {
            return res.status(500).json({ error: "Failed to generate redirect URL" });
        }
        console.log(redirectUrl)
        // const button = `<button><a href=${redirectUrl}>Sign in with Google</a></button>`
        // res.set("Content-Type", "text/html")
        // return res.send(button)
        return res.redirect(redirectUrl);
    } catch (error) {
        console.log(error)
        return res.json({ error })
    }
})

app.get("/api/auth/google/success", async (req, res) => {
    try {
        const { userId, secret } = req.query;
        if (!userId || !secret) {
            return res.redirect("http://localhost:5173/google-fail?reason=missing_params");
        }

        const { account } = await createAppwriteClient("admin");

        // Create a server-side session out of the callback's userId/secret
        const session = await account.createSession(userId, secret);

        // ⚠️ In dev (http), do not set secure:true
        res.cookie("session", session.secret, {
            httpOnly: true,
            secure: false,               // set to true only when you're on HTTPS
            sameSite: "lax",
            expires: new Date(session.expire),
            path: "/"
        });

        // Then send to your frontend success page
        return res.redirect("http://localhost:5173/google-success");
    } catch (error) {
        console.error("OAuth success handler error:", error);
        return res.redirect("http://localhost:5173/google-fail?reason=server_error");
    }
})

app.get("/api/auth/google/fail", (req, res) => {
    return res.redirect("http://localhost:5173/google-fail?reason=oauth_denied");
});


app.get("/api/auth/user", async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.send("You are not authenticated, please log in first!");
        }

        const { account } = await createAppwriteClient("session", sessionCookie);
        const user = await account.get();

        // Check if the user exists based on email or walletAddress
        const existingUser = await Buyer.findOne({ email: user.email }) || await Buyer.findOne({ walletAddress: user.$id });

        if (!existingUser) {
            // If the user doesn't exist, create a new one
            const newUser = new Buyer({
                fullName: user.name,
                email: user.email,
                walletAddress: "abdDummyAddress123",  // Assuming wallet address is the user's Appwrite ID
                photo: user.photo || "https://static.thenounproject.com/png/4530368-200.png",  // Default photo if none exists
            });

            // Save the new user in the database
            await newUser.save();

            // Generate the token for the newly registered user
            const token = jwt.sign(
                {
                    userId: newUser._id, wallet: newUser.walletAddress, username: newUser.fullName,  // Include username
                    email: newUser.email,
                },
                process.env.JWT_SECRET || "this-is-secret-value-for-now",
                { expiresIn: "2h" }  // Token expires in 2 hours
            );

            // Return success message with the new user data and token
            return res.json({ message: "New user successfully registered", user: newUser, token });
        } else {
            // If the user already exists, generate the token for the existing user
            const token = jwt.sign(
                {
                    userId: existingUser._id, wallet: existingUser.walletAddress, username: existingUser.fullName,  // Include username
                    email: existingUser.email
                },
                process.env.JWT_SECRET || "this-is-secret-value-for-now",
                { expiresIn: "2h" }  // Token expires in 2 hours
            );

            // Return message indicating the user already exists along with the token
            return res.json({ message: "User already exists", user: existingUser, token });
        }

    } catch (error) {
        console.error("Error during user fetch and registration:", error);
        return res.json({ error: error.message });
    }
});



module.exports = app;
