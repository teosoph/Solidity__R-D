require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const MNEMONIC = process.env.MNEMONIC;
const API_KEY = process.env.API_KEY_INFURA_ETHEREUM_SEPOLIA;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    paths: {
        tests: "./tests",
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    networks: {
        hardhat: {
            accounts: {
                mnemonic: MNEMONIC,
                path: "m/44'/60'/0'/0",
                initialIndex: 0,
                count: 20,
            },
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${API_KEY}`,
            accounts: {
                mnemonic: MNEMONIC,
            },
        },
    },
};

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    const provider = hre.ethers.provider;

    for (const account of accounts) {
        console.log(
            "%s (%i ETH)",
            account.address,
            hre.ethers.formatEther(
                // getBalance returns wei amount, format to ETH amount
                await provider.getBalance(account.address),
            ),
        );
    }
});
