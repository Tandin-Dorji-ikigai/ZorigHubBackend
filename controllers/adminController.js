const Admin = require('../models/adminModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Admin login function
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the admin by email
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        // Generate a JWT token (you can add any claims you need)
        const token = jwt.sign(
            { adminId: admin._id, email: admin.email },
            process.env.JWT_SECRET || 'your-secret-key', // Use your secret key for JWT
            { expiresIn: '2h' } // Token expiration time
        );

        // Return the token and admin data
        res.json({
            message: 'Login successful',
            token,
            admin: {
                _id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                walletAddress: admin.walletAddress,
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find();
        res.json(admins);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdminById = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id);
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const adminData = { ...req.body };

        if (adminData.password) {
            const saltRounds = 10;
            adminData.password = await bcrypt.hash(adminData.password, saltRounds);
        }

        const newAdmin = new Admin(adminData);
        await newAdmin.save();
        res.status(201).json(newAdmin);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message, details: err.errors || err });
    }
};

exports.updateAdmin = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // If password is being updated, hash it
        if (updateData.password) {
            const saltRounds = 10;
            updateData.password = await bcrypt.hash(updateData.password, saltRounds);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updatedAdmin);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteAdmin = async (req, res) => {
    try {
        await Admin.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAdminByWalletAddress = async (req, res) => {
    try {
        const admin = await Admin.findOne({ walletAddress: req.params.walletAddress });
        if (!admin) return res.status(404).json({ error: 'Admin not found' });
        res.json(admin);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
