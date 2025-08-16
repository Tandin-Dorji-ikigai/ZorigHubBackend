const getAccessToken = require("../../middleware/auth_ndi");
const axios = require("axios");

let proof_data = {}; // holds the last created proof response
let fetch_proof = {}; //holds the fetched proof response
// 🔹 POST /api/ndi/proof — Create proof request and store threadId


const createProofRequest = async (req, res) => {
  try {
    const token = await getAccessToken();

    const response = await axios.post(
      "https://demo-client.bhutanndi.com/verifier/v1/proof-request",
      {
        proofName: "Verify Foundational ID and Address",
        proofAttributes: [
          {
            name: "ID Number",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076", // Foundational ID
              },
            ],
          },
          {
            name: "Full Name",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
              },
            ],
          },
          {
            name: "Gender",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076", // Permanent Address
              },
            ],
          },
  
          {
            name: "Village",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/e3b606d0-e477-4fc2-b5ab-0adc4bd75c54",
              },
            ],
          },
          {
            name: "Gewog",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/e3b606d0-e477-4fc2-b5ab-0adc4bd75c54",
              },
            ],
          },
          {
            name: "Dzongkhag",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/e3b606d0-e477-4fc2-b5ab-0adc4bd75c54",
              },
            ],
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    proof_data = response.data.data;

    return res.status(201).json({
      message: "Proof request created",
      data: proof_data,
    });
  } catch (err) {
    console.error("Error creating proof request:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to create proof request" });
  }
};

// 🔹 GET /api/ndi/proof — Use stored threadId to fetch details
const getProofRequestDetails = async (req, res) => {
  const threadId = proof_data.proofRequestThreadId;
  const id = 10;
  const page = 1;
  const pageSize = 10;

  if (!threadId) {
    return res.status(400).json({ error: "No proof request created yet" });
  }

  try {
    const token = await getAccessToken();

    const response = await axios.get(
      "https://demo-client.bhutanndi.com/verifier/v1/proof-request",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "*/*",
        },
        params: { id, threadId, page, pageSize },
      }
    );
    fetch_proof = response.data.data
    res.status(200).json({
      message: "Proof request fetch successful",
      data: response.data.data,
    });
  } catch (error) {
    console.error("Failed to get proof request:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch proof request" });
  }
};

// POST /api/ndi/proof/relationship
const sendProofRequestUsingRelationship = async (req, res) => {
  const forRelationship = fetch_proof.relationshipDid;
  console.log(forRelationship)
  if (!forRelationship) {
    return res.status(400).json({ error: "No relationshipDid available from previous proof request" });
  }

  try {
    const token = await getAccessToken();

    const response = await axios.post(
      "https://demo-client.bhutanndi.com/verifier/v1/proof-request",
      {
        proofName: "Verify Foundational ID",
        proofAttributes: [
          {
            name: "ID Number",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
              },
            ],
          },
          {
            name: "Full Name",
            restrictions: [
              {
                schema_name:
                  "https://dev-schema.ngotag.com/schemas/c7952a0a-e9b5-4a4b-a714-1e5d0a1ae076",
              },
            ],
          },
        ],
        forRelationship,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(201).json({
      message: "Proof request sent to Bhutan NDI Wallet",
      data: response.data.data,
    });
  } catch (error) {
    console.error("Error sending proof request:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send proof request using relationship" });
  }
};


module.exports = {
  createProofRequest,
  getProofRequestDetails,
  sendProofRequestUsingRelationship
};
