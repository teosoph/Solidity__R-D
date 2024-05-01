const fs = require("fs");
const path = require("path");

const { ethers } = require("hardhat");
const data = require("../SITE3/backend/data.json");

async function main() {
    const deployer = data.deployerAddress;
    console.log("Deploying contracts with the account:", deployer);

    const DomainRegistry = await ethers.getContractFactory("DomainRegistryV3");

    const domainRegistry = await upgrades.deployProxy(
        DomainRegistry,
        [], // Параметры конструктора, если они есть
        {
            initializer: "initialize", // Метод инициализации
            from: deployer,
        },
    );

    console.log("DomainRegistry deployed to:", domainRegistry.target);

    // const tx = await domainRegistry.initialize();
    // await tx.wait();
    console.log("Contract initialized");

    const configPath = path.resolve(__dirname, "../SITE3/backend/data.json");
    let configContent = fs.readFileSync(configPath, "utf8");

    // Replace the existing contract address with the new one
    configContent = configContent.replace(/"deployedContractVersion"\s*:\s*"[^"]+"/, `"deployedContractVersion": "V3"`);

    configContent = configContent.replace(/"deployerAddress"\s*:\s*"[^"]+"/, `"deployerAddress": "${deployer}"`);
    configContent = configContent.replace(
        /"contractAddress"\s*:\s*"[^"]+"/,
        `"contractAddress": "${domainRegistry.target}"`,
    );

    // Write the updated content back to the config file
    fs.writeFileSync(configPath, configContent, "utf8");

    console.log("Config file updated with new contract address:", domainRegistry.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
