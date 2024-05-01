import config from "../config";

const abi = config.contractAbi;
const rpcUrl = config.jsonRpcUrl;
// const contractAddress = config.contractAddress;
const mnemonic = config.mnemonic;

// console.log(abi);

// Подключение к провайдеру и инициализация контракта
if (typeof window.ethereum !== "undefined") {
    const web3 = new Web3(window.ethereum);
    window.ethereum.enable();
} else {
    console.log("MetaMask is not installed!");
}

// const contractAddress = "0xf686e13440d4a480f510426692c2eee555fdcd3c"; // sepolia
// const contractAddress = "0x661fBb9e9559748a7946ce2DCa32cae5B3DD2d8E"; // hardhat
const contractAddress = config.contractAddress; // hardhat
const contractABI = "../DomainRegistryAbi.json"; // ABI контракта

// Реализация функций для взаимодействия с контрактом
function registerDomain(domainName) {
    console.log("Function registerDomain called with:", domainName);

    const paymentMethod = document.getElementById("paymentToken").value;
    const domainInput = document.getElementById("domainName").value;
    const fromAddress = web3.eth.accounts[0]; // Ваш текущий аккаунт

    if (paymentMethod === "ETH") {
        contract.methods
            .registerDomainWithETH(domainInput)
            .send({ from: fromAddress, value: web3.utils.toWei("1", "ether") })
            .then(function (tx) {
                console.log("Transaction: ", tx);
            })
            .catch(function (error) {
                console.error("Error: ", error);
            });
    } else if (paymentMethod === "USDT") {
        // Для USDT вам потребуется дополнительная логика для обработки токенов ERC20
    }
}

let web3;
let contract;

async function init() {
    if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" }); // Запрос доступа
        const contractABIResponse = await fetch(contractABI);
        if (!contractABIResponse.ok) {
            throw new Error(`Could not fetch ABI: ${contractABIResponse.statusText}`);
        }
        const contractABI = await contractABIResponse.json(); // Загрузка ABI
        contract = new web3.eth.Contract(contractABI, contractAddress);
    } else {
        console.log("MetaMask is not installed!");
    }
}

async function getRegistrationFee() {
    console.log("Function getRegistrationFee called");

    try {
        if (!contract) {
            throw new Error("Contract is not initialized.");
        }
        const feeInWei = await contract.methods.getRegistrationFee().call();
        const feeInEth = web3.utils.fromWei(feeInWei, "ether");
        document.getElementById("registrationFee").innerText = `Current registration fee: ${feeInEth} ETH`;
    } catch (error) {
        console.error("Error fetching registration fee: ", error.message); // Измените на error.message
        document.getElementById("registrationFee").innerText = "Error fetching fee: " + error.message;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    console.log("Document loaded, initializing...");
    init(); // Вызов функции инициализации

    const registerButton = document.getElementById("registerDomainButton");
    registerButton.addEventListener("click", function () {
        const domainName = document.getElementById("domainName").value;
        console.log("Registering domain:", domainName);
        registerDomain(domainName);
    });

    const feeButton = document.getElementById("getRegistrationFeeButton");
    feeButton.addEventListener("click", function () {
        console.log("Fetching registration fee...");
        getRegistrationFee();
    });
});
