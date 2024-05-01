const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers } = require("hardhat");

async function setup() {
    const signers = await ethers.getSigners();
    const deployerAddress = signers[0].address;
    console.log("deployerAddress: ------------", deployerAddress);

    const proxyModule = buildModule("ProxyModule", (m) => {
        const domainRegistry = m.contract("DomainRegistryV2");
        const proxy = m.contract("TransparentUpgradeableProxy", [domainRegistry, deployerAddress, "0x"]);

        const proxyAdminAddress = m.readEventArgument(proxy, "AdminChanged", "newAdmin");
        const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

        return { proxyAdmin, proxy };
    });

    const domainRegistryModule = buildModule("DomainRegistryModule", (m) => {
        const { proxy, proxyAdmin } = m.useModule(proxyModule);
        const domainRegistry = m.contractAt("DomainRegistryV2", proxy);

        return { domainRegistry, proxy, proxyAdmin };
    });

    return domainRegistryModule;
}

setup()
    .then((module) => {
        console.log("Setup complete, ready to deploy.");
    })
    .catch(console.error);
