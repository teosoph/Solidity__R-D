import { ethers } from "ethers";

const message = "John Smith";
const hash = ethers.hashMessage(message);
console.log(`Hash (${message}):`, hash);

const message2 = "Lisa Smith";
const hash2 = ethers.hashMessage(message2);
console.log(`Hash (${message2}):`, hash2);

const message3 = "Lisa smith";
const hash3 = ethers.hashMessage(message3);
console.log(`Hash (${message3}):`, hash3);

// let hexString = "0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20";
let hexString = "0x0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"+
  "2122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40"+
  "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"+
  "2122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40"+
  "0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f20"+
  "2122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f40";
const hash4 = ethers.keccak256(hexString);
console.log(`Hash ():`, hash4);
