import { ethers } from 'ethers';

console.log( "---------------Alice's side----------------" );

// import crypto from 'crypto';
// const privateKey = crypto.randomBytes(32);
const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'

const signingKey = new ethers.SigningKey(privateKey);

console.log("Private key: ", signingKey.privateKey);
console.log("Public key: ", signingKey.publicKey);
// console.log("Compressed public key: ", signingKey.compressedPublicKey);

const message = "Hello World!";
const hash = ethers.hashMessage(message);
let signature = signingKey.sign(hash);
console.log(signature);

console.log( "\n---------------Bob's side----------------" );

const recoveredPubKey = ethers.SigningKey.recoverPublicKey(ethers.hashMessage(message), signature);
const address = ethers.computeAddress(recoveredPubKey);
console.log("Recovered public key: ", recoveredPubKey);
console.log("Address: ", address);
