import { ethers } from "ethers";

const endpoint = "http://127.0.0.1:8545/";

(async ()=> {
// const provider = new ethers.getDefaultProvider(5) // 5 is goerli
  const provider = new ethers.JsonRpcProvider(endpoint);
  const signer = await provider.getSigner();
  console.log(await signer.signMessage("hello world"));

  let wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  // wallet = wallet.connect(provider);
  console.log(await wallet.signMessage("hello world"));

  const hdWallet = ethers.Wallet.fromPhrase(
    "test test test test test test test test test test test junk"
  );
  console.log(await hdWallet.signMessage("hello world"));
})();


