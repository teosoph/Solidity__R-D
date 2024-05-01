const { ethers } = require("hardhat");
const data = require("../SITE3/backend/data.json");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Using account:", deployer.address);

    // Адрес вашего деплоированного контракта
    const contractAddress = data.contractAddress;
    // const contractAddress = "0x40B39b1374a311B99c12033B584654b9ee69b438";
    console.log("Using contract Address:", data.contractAddress);

    // Подключаемся к контракту
    const DomainRegistry = await ethers.getContractFactory("DomainRegistryV3");
    const domainRegistry = DomainRegistry.attach(contractAddress);

    // Check Contract owner
    const contractOwner = await domainRegistry.owner();
    console.log("Contract owner:", contractOwner);
    // Вызов функции getRegistrationFee

    const fee = await domainRegistry.updateRegistrationFee(ethers.parseEther("0.1"), { from: deployer.address });
    console.log(`The current registration fee is: ${ethers.formatEther(fee)} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
