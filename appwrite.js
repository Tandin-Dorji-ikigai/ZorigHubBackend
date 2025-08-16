const { Client, Databases, Account } = require("node-appwrite");
const dotenv = require("dotenv");
dotenv.config()

exports.createAppwriteClient = async (type, session) => {
    const { ENDPOINT, PROJECT_ID, API_KEY } = process.env;
    console.log(ENDPOINT, PROJECT_ID, API_KEY);
    
    const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

    if (type === "admin") {
        client.setKey(API_KEY)
    }
    if (type === "session" && session) {
        client.setSession(session)
    }

    return {
        get account() {
            return new Account(client)
        },
        get databases() {
            return new Databases(client)
        },
    }
}

// export default createAppwriteClient;