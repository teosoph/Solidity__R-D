require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

const apiKey = require("../ENVIRONMENTS/api_key.json");
const etherscanApiKey = require("../ENVIRONMENTS/etherscan_api.json");

module.exports = {
    solidity: "0.8.19",
    networks: {
        sepolia: {
            url: `https://sepolia.infura.io/v3/${apiKey.infura.ethereum.sepolia}`,
            accounts: [process.env.PRIVATE_KEY].filter(Boolean),
        },
    },
    etherscan: {
        apiKey: etherscanApiKey.etherscan,
    },
};
