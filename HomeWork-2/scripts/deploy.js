const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deployer address:", deployer.address);

    const SimpleMessage = await hre.ethers.getContractFactory("SimpleMessage");
    const simpleMessage = await SimpleMessage.deploy("Ihor Kyrychenko, 07.03.2024");

    await simpleMessage.deployed();

    console.log("SimpleMessage deployed to:", simpleMessage.address);
}
//
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
