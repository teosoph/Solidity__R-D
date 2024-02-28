// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { ethers, keccak256 } from "ethers";

async function main() {

  const providerUrl = 'http://127.0.0.1:8545';
  const provider = new ethers.JsonRpcProvider(providerUrl);

  const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
  const wallet = new ethers.Wallet(privateKey, provider);

  const toAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const nonce = 2; // Replace with the correct nonce
  const value = ethers.parseEther('0'); // Sending 0 Ether

  // selector
  const signature = "set(uint256)";
  const signatureData = Uint8Array.from(Buffer.from(signature));
  const selector = keccak256(signatureData).substring(0, 10);
  console.log(`Selector: ${selector}`);
  // calldata
  const data = selector +'000000000000000000000000000000000000000000000000000000000000ffff';
  console.log(`Data: ${data}`)

  const transactionRequest = {
    chainId: 31337,
    nonce: nonce,
    gasLimit: 100000,
    gasPrice: ethers.parseUnits('30', 'gwei'), // Gas price in Gwei
    to: toAddress,
    value: value,
    data: data
  };

  const signedTransaction = await wallet.signTransaction(transactionRequest);
  console.log('Signed Transaction:', signedTransaction);

  const transactionResponse = await provider.broadcastTransaction(signedTransaction);

  const transactionRequest2 = {
    to: toAddress,
    data: "0x3fa4f245"  // selector of "value()" function signature
  };

  console.log(await provider.call(transactionRequest2));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
