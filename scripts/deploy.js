const hre = require("hardhat");

async function main() {
    // Создаем фабрику для контракта DomainRegistry
    const DomainRegistryFactory = await hre.ethers.getContractFactory("DomainRegistry");

    // Деплоим контракт DomainRegistry
    const DomainRegistry = await DomainRegistryFactory.deploy();
    console.log(`DomainRegistry deployed to: ${DomainRegistry.address}`);

    // // Ожидаем успешное развертывание контракта
    // await simpleMessage.waitForDeployment();
    // const contractAddr = await simpleMessage.getAddress();
    // console.log("SimpleMessage deployed to:", contractAddr);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
