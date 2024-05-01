const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const proxyModule = buildModule("ProxyModule", (m) => {
    const proxyAdminOwner = m.getAccount(0);
    const domainRegistry = m.contract("DomainRegistryV2");

    const proxy = m.contract("TransparentUpgradeableProxy", [domainRegistry, proxyAdminOwner, "0x"]);

    const proxyAdminAddress = m.readEventArgument(proxy, "AdminChanged", "newAdmin");

    const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

    return { proxyAdmin, proxy };
});

const domainRegistryModule = buildModule("DomainRegistryModule", (m) => {
    const { proxy, proxyAdmin } = m.useModule(proxyModule);
    const domainRegistry = m.contractAt("DomainRegistryV2", proxy);

    return { domainRegistry, proxy, proxyAdmin };
});

module.exports = domainRegistryModule;
