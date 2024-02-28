// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";
import fs from "fs";

async function main() {
  const abiBuffer = fs.readFileSync("./artifacts/contracts/Storage.sol/Storage.json");
  const abi = JSON.parse(abiBuffer.toString()).abi;

  const storage = await hre.ethers.getContractAt(abi, "0x5FbDB2315678afecb367f032d93F642f64180aa3");

  console.log(
    `Attached to ${storage.target}`
  );

  await storage.set(102);
  console.log(
    `Storage value is ${await storage.value()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
