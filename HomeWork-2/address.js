import { ethers, keccak256 } from "ethers";
import assert from "assert";

// Simple way to calculate Ethereum address from public key

const recoveredPubKey = "0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5";
const address = ethers.computeAddress(recoveredPubKey);
console.log("Address: ", address);

// Cross-check by Ethereum address definition

const pubKeyWithoutConstantPrefix = "0x" + recoveredPubKey.substring(4);
const hash = keccak256(pubKeyWithoutConstantPrefix);
console.log("Hash: ", hash);

const address2 = "0x"+ hash.substring(26) // right most 20 bytes
console.log("\nAddress (cross-check): ", address2);
//
assert(address.toLowerCase() === address2.toLowerCase(), "Addresses should match!!!");

// 0x048318535b54105d4a7aae60c08fc45f9687181b4fdfc625bd1a753fa7397fed753547f11ca8696646f2f3acb08e31016afac23e630c5d11f59f61fef57b0d2aa5

// 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
// 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
