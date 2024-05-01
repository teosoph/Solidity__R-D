// import { onClickConnect, onClickFetchTokenData, onClickBalanceOfTokens, onClickTransfer } from "./eventHandlers.js";
// import { init } from "./htmlElements.js";

import { Web3 } from "web3";
import config from "../../backend/config.js";

let web3;
let contract;

let elems;

const isMetaMaskInstalled = () => {
    const { ethereum } = window;
    return Boolean(ethereum && ethereum.isMetaMask);
};

window.addEventListener("load", async () => {
    if (typeof window.ethereum !== "undefined") {
        web3 = new Web3(window.ethereum);
        try {
            console.log("Using account Address for web request:", config.deployerAddress);
            console.log("Using contract Address for web request:", config.contractAddress);

            await window.ethereum.request({ method: "eth_requestAccounts" });
            contract = new web3.eth.Contract(config.contractAbi, config.contractAddress);
            console.log("Contract initialized successfully!!");
            document.getElementById("getRegistrationFeeButton").addEventListener("click", getRegistrationFee);
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
        const feeInEth = parseFloat(web3.utils.fromWei(feeInWei, "ether")).toFixed(8);
        console.log(`Current registration fee: ${feeInEth} ETH`);

        // Получаем элемент span по его ID
        const registrationFeeSpan = document.getElementById("registrationFee");
        // Устанавливаем текст элемента
        registrationFeeSpan.textContent = `${feeInEth} ETH`;
    } catch (error) {
        console.error("Error fetching registration fee:", error);

        // Вывод сообщения об ошибке в тот же элемент, если что-то пойдет не так
        const registrationFeeSpan = document.getElementById("registrationFee");
        registrationFeeSpan.textContent = "Error fetching registration fee.";
    }
}

async function registerDomain() {
    const domainName = document.getElementById("domainName").value;
    const paymentToken = document.getElementById("paymentToken").value;

    if (!domainName) {
        alert("Please enter a domain name.");
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0];

        const feeInWei = await contract.methods.getRegistrationFee().call();

        // Проверяем версию контракта
        if (contract.version === "V2") {
            // Вызов метода регистрации для версии V2
            const transaction = await contract.methods
                .registerDomain(domainName)
                .send({ from: account, value: feeInWei });
            console.log("Domain registered with V2:", transaction);
        } else if (contract.version === "V3") {
            if (paymentToken === "ETH") {
                const transaction = await contract.methods
                    .registerDomainWithETH(domainName)
                    .send({ from: account, value: feeInWei });
                console.log("Domain registered with ETH on V3:", transaction);
            } else if (paymentToken === "USDT") {
                const requiredUsdtAmount = await contract.methods.convertEthToUsdt(feeInWei).call();
                const transaction = await contract.methods
                    .registerDomainWithUsdt(domainName, requiredUsdtAmount)
                    .send({ from: account });
                console.log("Domain registered with USDT on V3:", transaction);
            }
        }
    } catch (error) {
        console.error("Error registering domain:", error);
        alert("Failed to register domain. Check console for more details.");
    }
}

document.getElementById("registerDomainButton").addEventListener("click", registerDomain);

async function updateRegistrationFee() {
    const newFee = document.getElementById("newFee").value; // Получаем новую стоимость регистрации из input

    if (!newFee) {
        alert("Please enter a new registration fee.");
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        const account = accounts[0]; // Адрес аккаунта MetaMask

        // Вызываем функцию обновления стоимости регистрации
        const transaction = await contract.methods.updateRegistrationFee(web3.utils.toWei(newFee));
        console.log("Registration fee updated:", transaction);
        alert("Registration fee updated successfully.");

        // Обновляем отображаемую стоимость на странице
        getRegistrationFee();
    } catch (error) {
        console.error("Error updating registration fee:", error);
        alert("Failed to update registration fee. Check console for more details.");
    }
}

document.getElementById("updateFeeButton").addEventListener("click", updateRegistrationFee);
