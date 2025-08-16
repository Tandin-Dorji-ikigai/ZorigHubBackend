const axios = require("axios");
require("dotenv").config();

async function getAccessToken() {
    const res = await axios.post(
        "https://staging.bhutanndi.com/authentication/v1/authenticate",
        {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            grant_type: "client_credentials",
        },
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
    return res.data.access_token;
}

module.exports = getAccessToken;
