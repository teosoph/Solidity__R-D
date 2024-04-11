import hre from "hardhat";

async function main() {
    const hw = await hre.ethers.deployContract("contracts/DomainRegistryV1.sol:DomainRegistry");

    console.log(`DomainRegistryV1" deployed to ${hw.address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
