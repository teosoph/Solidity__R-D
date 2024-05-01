const { ethers, upgrades } = require("hardhat");
const fs = require("fs");

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ProxyModule = require("./ProxyModule");

/**
 * This module upgrades the proxy to a new version of the Demo contract.
 */
const upgradeModule = buildModule("DeployV2Module", (m) => {
    // Make sure we're using the account that owns the ProxyAdmin contract.
    const proxyAdminOwner = m.getAccount(0);
    // console.log("Proxy Admin Owner: ---------- ", proxyAdminOwner);

    // Get the proxy and proxy admin from the previous module.
    const { proxyAdmin, proxy } = m.useModule(ProxyModule);
    // console.log("Proxy Admin : ---------- ", proxyAdmin);

    // This is the new version of the Demo contract that we want to upgrade to.
    const DomainRegistryV2 = m.contract("DomainRegistryV2");

    // Upgrade the proxy to the new version of the Demo contract.
    // This function also accepts a data parameter, which can be used to call a function,
    // but we don't need it here so we pass an empty hex string ("0x").
    m.call(proxyAdmin, "upgradeAndCall", [proxy, DomainRegistryV2, "0x"], {
        from: proxyAdminOwner,
    });

    // Return the proxy and proxy admin so that they can be used by other modules.
    return { proxyAdmin, proxy };
});

module.exports = upgradeModule;

// npx hardhat ignition deploy ignition/modules/V2.js --network localhost
