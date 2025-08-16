const hre = require("hardhat");

async function main() {
    const Zorighub = await hre.ethers.getContractFactory("Zorighub");
    const escrow = await Zorighub.deploy();
    await escrow.waitForDeployment();

    const address = await escrow.getAddress();
    console.log(`Zorighub deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
