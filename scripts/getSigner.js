// scripts/getSigner.js
const { ethers } = require("hardhat");

async function getSigner(index = 0) {
    const signers = await ethers.getSigners();
    if (index < signers.length) {
        return signers[index];
    } else {
        throw new Error("Requested signer index out of bounds");
    }
}

module.exports = { getSigner };
