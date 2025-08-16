const Buyer = require('../models/buyerModel');

exports.getAllBuyers = async (req, res) => {
    try {
        const buyers = await Buyer.find();
        res.json(buyers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBuyerById = async (req, res) => {
    try {
        const buyer = await Buyer.findById(req.params.id);
        if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
        res.json(buyer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createBuyer = async (req, res) => {
    try {
        const buyerData = req.body;
        const newBuyer = new Buyer(buyerData);
        await newBuyer.save();
        res.status(201).json(newBuyer);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message, details: err.errors || err });
    }
};

exports.updateBuyer = async (req, res) => {
    try {
        const updatedBuyer = await Buyer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedBuyer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteBuyer = async (req, res) => {
    try {
        await Buyer.findByIdAndDelete(req.params.id);
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBuyerByWalletAddress = async (req, res) => {
    try {
        const buyer = await Buyer.findOne({ walletAddress: req.params.walletAddress });
        if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
        res.json(buyer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getBuyerByEmail = async (req, res) => {
    try {
        const buyer = await Buyer.findOne({ email: req.params.email });
        if (!buyer) return res.status(404).json({ error: 'Buyer not found' });
        res.json(buyer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.updateBuyerWallet = async (req, res) => {
    const { walletAddress } = req.body; // Getting the new wallet address from the request body

    if (!walletAddress) {
        return res.status(400).json({ message: 'Wallet address is required' });
    }

    try {
        // Find the buyer by ID and update their wallet address
        const updatedBuyer = await Buyer.findByIdAndUpdate(
            req.params.id, // Use the buyer's ID from the URL parameter
            { walletAddress }, // Update only the walletAddress
            { new: true } // Return the updated buyer
        );

        if (!updatedBuyer) {
            return res.status(404).json({ message: 'Buyer not found' });
        }

        res.status(200).json(updatedBuyer); // Return the updated buyer data
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating wallet address', error });
    }
};
