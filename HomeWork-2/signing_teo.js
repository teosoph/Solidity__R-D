import { ethers } from 'ethers';

// // ---------------Teo's side----------------

// import crypto from 'crypto';
// const privateKey = crypto.randomBytes(32);

// // const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

// const signingKey = new ethers.SigningKey(privateKey);

// console.log("Private key: ", signingKey.privateKey);
// console.log("Public key: ", signingKey.publicKey);
// // console.log("Compressed public key: ", signingKey.compressedPublicKey);

// const message = "Hello Andriy Chestnih!";
// const hash = ethers.hashMessage(message);
// let signature = signingKey.sign(hash);
// console.log(signature);

// // ---------------Andriy's side----------------

// const recoveredPubKey = ethers.SigningKey.recoverPublicKey(ethers.hashMessage(message), signature);
// console.log("\nRecovered public key: ", recoveredPubKey);



// --------------- HomeWork-1 ----------------
async function homeWork_1() {

// Згенеруйте seed-фразу у безпечний спосіб:
const mnemonic = "wide fabric license attract barrel apple news behave move direct piano sauce vendor window hunt time flight gloom topic copy shield primary morning pen"; // 24 слова
const path = "m/44'/60'/0'/0/0";  // Это стандартный путь для Ethereum
const wallet = ethers.Wallet.fromMnemonic(mnemonic, path);

console.log("My ETH wallet: ", wallet);
console.log("My ETH wallet.address: ", wallet.address);
console.log("My ETH private key: ", wallet.privateKey);

const publicKey = ethers.utils.computePublicKey(wallet.privateKey);
console.log("My ETH public key: ", publicKey);

// Підпишіть дані типу string із власним ім'ям, прізвищем і поточною датою:
const message = "Ihor Kyrychenko, 07.09.2023";  
const hash = ethers.utils.hashMessage(message);
const signature = await wallet.signMessage(hash);
console.log("My ETH signature: ", signature);

// Надайте дані і підпис разом із адресою, яку ви використали для підпису:
const result = {
    address: wallet.address,
    message: message,
    signature: signature
};

console.log("Result for homeWork-2:", result);}

homeWork_1();
