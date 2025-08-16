const Metadata = require('../models/metadataModel');

exports.getAllMetadata = async (req, res) => {
    try {
        const metadata = await Metadata.find();
        res.json(metadata);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMetadataById = async (req, res) => {
    try {
        const metadata = await Metadata.findById(req.params.id);
        if (!metadata) return res.status(404).json({ error: 'Metadata not found' });
        res.json(metadata);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createMetadata = async (req, res) => {
    try {
        const metadataData = req.body;
        const newMetadata = new Metadata(metadataData);
        await newMetadata.save();
        res.status(201).json(newMetadata);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateMetadata = async (req, res) => {
    try {
        const updatedMetadata = await Metadata.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedMetadata) {
            return res.status(404).json({ error: 'Metadata not found' });
        }
        res.json(updatedMetadata);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.deleteMetadata = async (req, res) => {
    try {
        const deleted = await Metadata.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Metadata not found' });
        }
        res.status(204).end();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
