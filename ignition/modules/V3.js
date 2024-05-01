const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ProxyModule = require("./ProxyModule");

const upgradeModule = buildModule("UpgradeV2Module", (m) => {
    // Get the proxy and proxy admin from the previous module.
    const { proxyAdmin, proxy } = m.useModule(ProxyModule);

    // Return the proxy and proxy admin so that they can be used by other modules.
    return { proxyAdmin, proxy };
});

/**
 * This is the final module that will be run.
 *
 * It takes the proxy from the previous module and uses it to create a local contract instance
 * for the DemoV2 contract. This allows us to interact with the DemoV2 contract via the proxy.
 */
const LatestVersionAddressProxy = buildModule("LatestVersionAddressProxy", (m) => {
    // Get the proxy from the previous module.
    const { proxy } = m.useModule(upgradeModule);

    // Create a local contract instance for the DemoV2 contract.
    // This line tells Hardhat Ignition to use the DemoV2 ABI for the contract at the proxy address.
    // This allows us to call functions on the DemoV2 contract via the proxy.
    const demo = m.contractAt("DomainRegistryV3", proxy);

    // Return the contract instance so that it can be used by other modules or in tests.
    return { demo };
});

module.exports = LatestVersionAddressProxy;

// npx hardhat ignition deploy ignition/modules/V3.js --network localhost
