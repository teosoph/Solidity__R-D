const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

async function main() {
    // Чтение адреса контракта V1 из файла
    const addresses = JSON.parse(fs.readFileSync("ignition/deployments/chain-31337/deployed_addresses.json", "utf8"));
    const v1Address = addresses["V1#V1"];

    // Получение фабрики контрактов для V2
    const V2 = await ethers.getContractFactory("V2");

    // Выполнение апгрейда контракта
    console.log(`Upgrading V1 at address ${v1Address} to V2...`);
    const v2Contract = await upgrades.upgradeProxy(v1Address, V2);

    console.log(`Contract upgraded. V2 address: ${v2Contract.address}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// npx hardhat ignition deploy ignition/modules/V2.js --network localhost
