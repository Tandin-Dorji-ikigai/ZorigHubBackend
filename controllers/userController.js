const Artisan = require('../models/userModel');

const ALLOWED_UPDATE_FIELDS = [
    'fullName',
    'artisanDescription',
    'gender',
    'CID',
    'gewog',
    'dzongkhag',
    'isActive',
    'photo',
];

function pickAllowed(body) {
    const out = {};
    for (const k of ALLOWED_UPDATE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k];
    }
    return out;
}


function handleMongooseError(err, res) {
    // Duplicate key (e.g., CID)
    if (err && (err.code === 11000 || err.code === 11001)) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({ error: `Duplicate ${field}.` });
    }
    // Invalid ObjectId
    if (err?.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid id format.' });
    }
    return res.status(400).json({ error: err.message || 'Bad Request' });
}

exports.getAllUsers = async (req, res) => {
    try {
        const users = await Artisan.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await Artisan.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createUser = async (req, res) => {
    try {

        const userData = req.body;
        const newUser = new Artisan(userData);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message, details: err.errors || err });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await Artisan.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await Artisan.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getUserByCID = async (req, res) => {
    try {
        const user = await Artisan.findOne({ CID: req.params.CID });
        if (!user) return res.status(404).json({ error: 'Artisan not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateUserByCID = async (req, res) => {
    try {
        const updates = pickAllowed(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update.' });
        }

        const updated = await Artisan.findOneAndUpdate(
            { CID: req.params.CID },
            { $set: updates },
            { new: true, runValidators: true, context: 'query' }
        );

        if (!updated) return res.status(404).json({ error: 'Artisan not found' });
        res.json(updated);
    } catch (err) {
        return handleMongooseError(err, res);
    }
};

exports.patchUser = async (req, res) => {
    try {
        const updates = pickAllowed(req.body);
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: 'No valid fields to update.' });
        }

        const updated = await Artisan.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true, context: 'query' }
        );

        if (!updated) return res.status(404).json({ error: 'User not found' });
        res.json(updated);
    } catch (err) {
        return handleMongooseError(err, res);
    }
};
