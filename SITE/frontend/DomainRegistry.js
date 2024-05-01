import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

import Web3 from "web3";

import domainRegistryAbi from "./../DomainRegistryAbi.json"; // Предполагается, что ABI вашего контракта сохранен в этом файле

const web3 = new Web3(Web3.givenProvider);
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Замените на адрес вашего контракта
const domainRegistryContract = new web3.eth.Contract(domainRegistryAbi, contractAddress);

function DomainRegistry() {
    const [account, setAccount] = useState(null);
    const [domainName, setDomainName] = useState("");
    const [registrationFee, setRegistrationFee] = useState("");
    const [paymentAmount, setPaymentAmount] = useState("");
    const [currency, setCurrency] = useState("ETH"); // Default to ETH

    useEffect(() => {
        async function load() {
            const accounts = await web3.eth.requestAccounts();
            setAccount(accounts[0]);
            const feeInWei = await domainRegistryContract.methods.getRegistrationFee().call();
            const feeInEth = web3.utils.fromWei(feeInWei, "ether");
            setRegistrationFee(feeInEth);
        }

        load();
    }, []);

    const handleRegisterDomain = async (e) => {
        e.preventDefault();
        const amountInWei = web3.utils.toWei(paymentAmount, "ether");

        if (currency === "ETH") {
            await domainRegistryContract.methods
                .registerDomainWithETH(domainName)
                .send({ from: account, value: amountInWei });
        } else if (currency === "USDT") {
            await domainRegistryContract.methods
                .registerDomainWithUsdt(domainName, amountInWei)
                .send({ from: account });
        }
    };

    return (
        <div className="container mt-5">
            <h1>Domain Registration</h1>
            <form onSubmit={handleRegisterDomain}>
                <div className="form-group">
                    <label>Domain Name:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Payment Amount in {currency}:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Currency:</label>
                    <select className="form-control" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                        <option value="ETH">ETH</option>
                        <option value="USDT">USDT</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">
                    Register
                </button>
            </form>
        </div>
    );
}

export default DomainRegistry;

ReactDOM.render(<DomainRegistry />, document.getElementById("root"));
