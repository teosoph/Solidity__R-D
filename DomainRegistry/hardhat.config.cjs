require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");

let MNEMONIC, API_KEY, ETHERSCAN_API_KEY;

if (process.env.CI) {
    MNEMONIC = process.env.MNEMONIC;
    API_KEY = process.env.API_KEY_INFURA_ETHEREUM_SEPOLIA;
    ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
} else {
    const {
        infura: {
            ethereum: { sepolia: LOCAL_API_KEY },
        },
    } = require("../ENVIRONMENTS/api_key.json");
    const { etherscan: LOCAL_ETHERSCAN_API_KEY } = require("../ENVIRONMENTS/etherscan_api.json");
    const { myMnemonic24: LOCAL_MNEMONIC } = require("../ENVIRONMENTS/mnemonics.json");

    MNEMONIC = LOCAL_MNEMONIC;
    API_KEY = LOCAL_API_KEY;
    ETHERSCAN_API_KEY = LOCAL_ETHERSCAN_API_KEY;
}

console.log("MNEMONIC exists:", !!MNEMONIC);
console.log("API_KEY exists:", !!API_KEY);
console.log("ETHERSCAN_API_KEY exists:", !!ETHERSCAN_API_KEY);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.19",
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
