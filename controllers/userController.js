const Artisan = require('../models/userModel');
// const Role = require('../models/roleModel');

// const AWS = require('aws-sdk');
// const multer = require('multer');
// const sharp = require('sharp');

// Configure AWS S3
// const s3 = new AWS.S3({
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: process.env.AWS_REGION
// });

// Multer memory storage configuration for user photo uploads
// const upload = multer({ storage: multer.memoryStorage() });

// Middleware to use in routes for single user photo upload
// exports.uploadUserPhoto = upload.single('photo');

// Update user photo (upload to S3, process with sharp)
// exports.updateUserPhoto = async (req, res) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({ error: 'User photo is required.' });
//         }

//         // Optionally process the image (resize, compress, etc.)
//         const processedBuffer = await sharp(req.file.buffer)
//             .resize({ width: 400 }) // Example: resize to 400px width
//             .jpeg({ quality: 80 })
//             .toBuffer();

//         const fileName = `user-photos/${Date.now().toString()}-${req.file.originalname}`;
//         const uploadResult = await s3.upload({
//             Bucket: process.env.AWS_S3_BUCKET_NAME,
//             Key: fileName,
//             Body: processedBuffer,
//             ContentType: 'image/jpeg',
//             // ACL: 'public-read'
//         }).promise();

//         const photoUrl = uploadResult.Location;
//         const updateData = { photo: photoUrl };

//         const updatedUser = await User.findByIdAndUpdate(
//             req.params.id,
//             updateData,
//             { new: true }
//         );
//         if (!updatedUser) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         res.json(updatedUser);
//     } catch (err) {
//         console.error(err);
//         res.status(400).json({ error: err.message, details: err.errors || err });
//     }
// };

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
        // let photoUrl = null;
        // if (req.file) {
        //     // Optionally process the image (resize, compress, etc.)
        //     const processedBuffer = await sharp(req.file.buffer)
        //         .resize({ width: 400 })
        //         .jpeg({ quality: 80 })
        //         .toBuffer();

        //     const fileName = `user-photos/${Date.now().toString()}-${req.file.originalname}`;
        //     const uploadResult = await s3.upload({
        //         Bucket: process.env.AWS_S3_BUCKET_NAME,
        //         Key: fileName,
        //         Body: processedBuffer,
        //         ContentType: 'image/jpeg',
        //         // ACL: 'public-read'
        //     }).promise();

        //     photoUrl = uploadResult.Location;
        // }

        // const userData = { ...req.body };
        // if (photoUrl) userData.photo = photoUrl;

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

exports.getUserByWalletAddress = async (req, res) => {
    try {
        const user = await Artisan.findOne({ walletAddress: req.params.walletAddress });
        if (!user) return res.status(404).json({ error: 'Artisan not found' });
        res.json(user);
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

// Get all users with role "Artisan"
// exports.getArtisans = async (req, res) => {
//     try {
//         // Find the roleId for "Artisan"
//         const artisanRole = await Role.findOne({ name: /artisan/i });
//         if (!artisanRole) {
//             return res.status(404).json({ error: 'Artisan role not found' });
//         }
//         const artisans = await User.find({ roleId: artisanRole._id });
//         res.json(artisans);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // Get all users with role "Buyer"
// exports.getBuyers = async (req, res) => {
//     try {
//         // Find the roleId for "Buyer"
//         const buyerRole = await Role.findOne({ name: /buyer/i });
//         if (!buyerRole) {
//             return res.status(404).json({ error: 'Buyer role not found' });
//         }
//         const buyers = await User.find({ roleId: buyerRole._id });
//         res.json(buyers);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// // Get all users with role "Admin"
// exports.getAdmins = async (req, res) => {
//     try {
//         // Find the roleId for "Admin"
//         const adminRole = await Role.findOne({ name: /admin/i });
//         if (!adminRole) {
//             return res.status(404).json({ error: 'Admin role not found' });
//         }
//         const admins = await User.find({ roleId: adminRole._id });
//         res.json(admins);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };
