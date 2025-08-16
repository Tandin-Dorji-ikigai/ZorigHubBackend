const express = require("express");
const router = express.Router();

const { fetchAccessToken } = require("../controllers/ndi/fetch_ndi_token");
const { getProofRequestDetails, createProofRequest, sendProofRequestUsingRelationship } = require("../controllers/ndi/proof_request");


// Fetch token
router.get("/token", fetchAccessToken);

// Create proof request
router.post("/proof", createProofRequest);
router.get("/proof", getProofRequestDetails);
router.post("/proof/relationship", sendProofRequestUsingRelationship);

module.exports = router;
