import { HDNodeWallet } from 'ethers';

const mnemonic = 'test test test test test test test test test test test junk';

const message = "Hello World!";

(async () => {
  const hdwallet = HDNodeWallet.fromPhrase(mnemonic);
  console.log("Private key0: ", hdwallet.privateKey); // default path m/44'/60'/0'/0/0
  console.log("Address0: ", hdwallet.address);
  console.log("Signature0: ", await hdwallet.signMessage(message));

  const hdwallet1 = HDNodeWallet.fromPhrase(mnemonic, null, "m/44'/60'/0'/0/1");
  console.log("\nPrivate key1: ", hdwallet1.privateKey);
  console.log("Address1: ", hdwallet1.address);
  console.log("Signature1: ", await hdwallet1.signMessage(message));
})();
