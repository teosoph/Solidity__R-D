import { ethers } from "ethers";

const endpoint = "http://127.0.0.1:8545/";

// const provider = new ethers.getDefaultProvider(5) // 5 is goerli
const provider = new ethers.JsonRpcProvider(endpoint);

(async ()=> {
  const blockNumber = await provider.getBlockNumber();
  console.log(blockNumber);
  const network = await provider.getNetwork();
  console.log(network.toJSON());
  const balance = await provider.getBalance("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  console.log(ethers.formatEther(balance));
})();

