const multer = require('multer');
const FormData = require('form-data');
const axios = require('axios');
const rateLimit = require('express-rate-limit');

const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB || 10);
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

const limiter = rateLimit({ windowMs: 60 * 1000, max: 30 });

const storage = multer.memoryStorage();
const baseMulter = multer({
    storage,
    limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype?.startsWith('image/')) return cb(null, true); 
        cb(new Error('Only image/* files are allowed.'));
    },
});

// export two middlewares
const upload = baseMulter;
const uploadMany = baseMulter;

function authHeaders(form) {
    return form.getHeaders(
        PINATA_JWT
            ? { Authorization: `Bearer ${PINATA_JWT}` }
            : { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_API_SECRET }
    );
}

async function pinBufferToIPFS({ buffer, originalname, mimetype }, meta = {}) {
    const form = new FormData();
    form.append('file', buffer, { filename: originalname, contentType: mimetype });
    form.append('pinataMetadata', JSON.stringify({
        name: `zorighub_${meta.kind || 'generic'}_${Date.now()}_${originalname}`,
        keyvalues: { ...meta },
    }));
    form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const { data } = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        form,
        { headers: authHeaders(form), maxBodyLength: Infinity }
    );
    const ipfsHash = data.IpfsHash;
    const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    return { ipfsHash, gatewayUrl };
}

async function pinToIPFS(req, res) {
    try {
        limiter(req, res, () => { });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded (field "file").' });

        const { kind = 'generic', userId = '', productId = '' } = req.body;
        const meta = { kind, userId, productId };

        const out = await pinBufferToIPFS(req.file, meta);

        return res.json({
            ok: true,
            ...out,
            mimeType: req.file.mimetype,
            size: req.file.size,
            originalName: req.file.originalname,
        });
    } catch (err) {
        console.error('[Pinata Upload Error]', err?.response?.data || err.message || err);
        const status = err?.response?.status || 500;
        return res.status(status).json({ error: 'Failed to upload image to IPFS.', details: err?.response?.data || err.message });
    }
}

async function pinToIPFSMany(req, res) {
    try {
        limiter(req, res, () => { });
        const files = req.files || [];
        if (!files.length) return res.status(400).json({ error: 'No files uploaded (field "files").' });
        if (files.length > 4) return res.status(400).json({ error: 'Max 4 images allowed.' });

        const { kind = 'product', userId = '', productId = '' } = req.body;
        const meta = { kind, userId, productId };

        const items = await Promise.all(
            files.map(async (f) => {
                const out = await pinBufferToIPFS(f, meta);
                return {
                    ...out,
                    mimeType: f.mimetype,
                    size: f.size,
                    originalName: f.originalname,
                };
            })
        );

        return res.json({ ok: true, count: items.length, items });
    } catch (err) {
        console.error('[Pinata Batch Upload Error]', err?.response?.data || err.message || err);
        const status = err?.response?.status || 500;
        return res.status(status).json({ error: 'Failed to upload images to IPFS.', details: err?.response?.data || err.message });
    }
}

module.exports = { upload, uploadMany, pinToIPFS, pinToIPFSMany };
