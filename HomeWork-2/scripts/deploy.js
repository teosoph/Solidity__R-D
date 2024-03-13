const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deployer address:", deployer.address);

    const SimpleMessage = await hre.ethers.getContractFactory("SimpleMessage");
    const simpleMessage = await SimpleMessage.deploy("Ihor Kyrychenko, 07.03.2024");

    await simpleMessage.waitForDeployment();
    const contractAddr = await simpleMessage.getAddress();
    console.log("SimpleMessage deployed to:", contractAddr);

    const res = await simpleMessage.message();
    console.log(res);
}
//
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat run scripts/deploy.js --network localhost
