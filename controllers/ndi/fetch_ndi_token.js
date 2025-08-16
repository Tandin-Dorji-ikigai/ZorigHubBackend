const getAccessToken = require("../../middleware/auth_ndi");

const fetchAccessToken = async (req, res) => {
  try {
    const token = await getAccessToken();
    res.status(200).json({ accessToken: token });
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(500).json({ error: "Failed to retrieve access token" });
  }
};

module.exports = { fetchAccessToken };
