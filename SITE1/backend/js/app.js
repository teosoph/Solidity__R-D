// import config from "../config";
const config = require("../../../SITE3/frontend/src/config");

const rpcUrl = config.jsonRpcUrl;
const contractAddress = config.contractAddress;
const contractABI = config.contractAbi;

let web3;
let contract;

window.addEventListener("load", async () => {
    if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" });
            contract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Contract initialized successfully1");
        } catch (error) {
            console.error("Error initializing contract:", error);
        }
    } else {
        console.log("MetaMask is not installed!");
    }
});

async function getRegistrationFee() {
    console.log("Fetching registration fee...");
    try {
        if (!contract) {
            throw new Error("Contract is not initialized.");
        }
        const feeInWei = await contract.methods.getRegistrationFee().call();
        const feeInEth = web3.utils.fromWei(feeInWei, "ether");
        console.log(`Current registration fee: ${feeInEth} ETH`);
    } catch (error) {
        console.error("Error fetching registration fee:", error);
    }
}

document.getElementById("getRegistrationFeeButton").addEventListener("click", getRegistrationFee);
