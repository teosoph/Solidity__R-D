import assert from "assert";
import { ethers } from "hardhat";
import { upgrades } from "@nomiclabs/hardhat-upgrades";

(async () => {
    const ContractV2 = await ethers.getContractFactory("contracts/DomainRegistryV2.sol:DomainRegistry");
    const address = "0x661fBb9e9559748a7946ce2DCa32cae5B3DD2d8E";
    const upgradedToContractV2 = await upgrades.upgradeProxy(address, ContractV2);
    console.log("DomainRegistryV1 upgraded\n");

    console.log("address:", address);
    console.log("DomainRegistryV2 address:", await upgradedToContractV2.getAddress());

    assert((await upgradedToContractV2.getAddress()) === address);

    console.log("\nAddresses are the same!");
})();
