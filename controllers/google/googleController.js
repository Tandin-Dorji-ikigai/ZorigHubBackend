
const { createAppwriteClient } = require('./appwrite');
const { OAuthProvider } = require('node-appwrite');
const jwt = require('jsonwebtoken');
const Buyer = require('../../models/buyerModel');

// GET /api/auth/google/start
exports.startGoogleAuth = async (req, res) => {
    try {
        const { account } = await createAppwriteClient('admin');

        const redirectUrl = await account.createOAuth2Token(
            OAuthProvider.Google,
            // success + fail callbacks must point to your backend (proxy is ok if set up)
            'http://localhost:5173/api/auth/google/success',
            'http://localhost:5173/api/auth/google/fail'
        );

        if (!redirectUrl) {
            return res.status(500).json({ error: 'Failed to generate redirect URL' });
        }
        return res.redirect(redirectUrl);
    } catch (error) {
        console.error('OAuth start error:', error);
        return res.status(500).json({ error: 'OAuth start failed' });
    }
};

// GET /api/auth/google/success
exports.googleAuthSuccess = async (req, res) => {
    try {
        const { userId, secret } = req.query;
        if (!userId || !secret) {
            return res.redirect('http://localhost:5317/google-fail?reason=missing_params');
        }

        const { account } = await createAppwriteClient('admin');
        const session = await account.createSession(userId, secret);

        console.log('Session created:', session);
        console.log(req.query)
        res.cookie('session', session.secret, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            expires: new Date(session.expire),
            path: '/',
        });

        return res.redirect('http://localhost:5317/google-success');

    } catch (error) {
        console.error('OAuth success handler error:', error);
        return res.redirect('http://localhost:5317/google-fail?reason=server_error');
    }
};

// GET /api/auth/google/fail
exports.googleAuthFail = (req, res) => {
    return res.redirect('http://localhost:5317/google-fail?reason=oauth_denied');
};

// GET /api/auth/user
exports.getUser = async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.status(401).json({ error: 'You are not authenticated, please log in first!' });
        }

        const { account } = await createAppwriteClient('session', sessionCookie);
        const user = await account.get();

        const existingUser =
            (await Buyer.findOne({ email: user.email })) ||
            (await Buyer.findOne({ walletAddress: user.$id }));

        if (!existingUser) {
            const newUser = new Buyer({
                fullName: user.name,
                email: user.email,
                walletAddress: 'abdDummyAddress123',
                photo: user.photo || 'https://static.thenounproject.com/png/4530368-200.png',
            });

            await newUser.save();

            const token = jwt.sign(
                {
                    userId: newUser._id,
                    wallet: newUser.walletAddress,
                    username: newUser.fullName,
                    email: newUser.email,
                },
                process.env.JWT_SECRET || 'this-is-secret-value-for-now',
                { expiresIn: '2h' }
            );

            return res.json({ message: 'New user successfully registered', user: newUser, token });
        } else {
            const token = jwt.sign(
                {
                    userId: existingUser._id,
                    wallet: existingUser.walletAddress,
                    username: existingUser.fullName,
                    email: existingUser.email,
                },
                process.env.JWT_SECRET || 'this-is-secret-value-for-now',
                { expiresIn: '2h' }
            );

            return res.json({ message: 'User already exists', user: existingUser, token });
        }
    } catch (error) {
        console.error('Error during user fetch and registration:', error);
        return res.status(500).json({ error: error.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.status(401).json({ error: 'Not authenticated' });
        }

        const { account } = await createAppwriteClient('session', sessionCookie);
        const appwriteUser = await account.get();

        return res.json({
            id: appwriteUser.$id,
            name: appwriteUser.name,
            email: appwriteUser.email,
        });
    } catch (e) {
        console.error('ME error:', e);
        return res.status(401).json({ error: 'Session invalid' });
    }
};
