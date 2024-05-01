const { ethers } = require("hardhat");
const data = require("./../SITE3/backend/data.json");
const deployedAddresses = require("../ignition/deployments/chain-31337/deployed_addresses.json");

async function main() {
    // const [deployer] = await ethers.getSigners();

    // console.log("Using account:", deployer.address);

    // Адрес вашего деплоированного контракта
    // const contractAddress = data.contractAddress;
    // const contractAddress = deployedAddresses["ProxyModule#ProxyAdmin"];
    const contractAddress = "0xc50a3495824f2cc801a4969c799204e64b3e7fa1";
    console.log("Using contract Address:", contractAddress);

    // Подключаемся к контракту
    const DomainRegistry = await ethers.getContractFactory("DomainRegistryV2");
    const domainRegistry = DomainRegistry.attach(contractAddress);

    // Вызов функции getRegistrationFee
    const fee = await domainRegistry.getRegistrationFee();
    console.log(`The current registration fee is: ${ethers.formatEther(fee)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
