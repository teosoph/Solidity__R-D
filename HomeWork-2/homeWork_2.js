import { ethers } from "ethers";
import { HDNodeWallet } from "ethers";

import { writeFile, mkdir } from "fs/promises";
import mnemonicData from "../ENVIRONMENTS/mnemonics.json" assert { type: "json" };

async function setupDirectory() {
    try {
        await mkdir("download", { recursive: true });
    } catch (e) {
        if (e.code !== "EEXIST") {
            console.error("Directory creation error:", e);
            throw e;
        }
    }
}

async function homeWork_2() {
    // Шаг 1: Генерация Seed-фразы и создание кошелька

    const mnemonic = mnemonicData.myMnemonic24;
    console.log("mnemonic-------------", mnemonic);

    // Создание кошелька из мнемонической фразы
    const wallet = HDNodeWallet.fromPhrase(mnemonic);

    console.log("My ETH wallet: ", wallet);
    console.log("My ETH wallet.address: ", wallet.address);
    console.log("My ETH private key: ", wallet.privateKey);

    // Подписание сообщения
    const message = "Ihor Kyrychenko, 07.03.2024";
    const signature = await wallet.signMessage(message);
    console.log("My ETH signature: ", signature);

    // Верификация подписи и адреса
    const recoveredAddress = ethers.verifyMessage(message, signature);
    console.log(`Recovered Address: ${recoveredAddress}`);
    const originalAddress = "0xA62795cc821EDFd2D39D72e42e02714995131fD8";
    console.assert(originalAddress === recoveredAddress, "The signature is valid and matches the original address.");

    // Запись данных в файл
    const dataToWrite = `
My ETH wallet.address: ${wallet.address}
My ETH private key: ${wallet.privateKey}
My ETH signature: ${signature}
Result for homeWork-2:
  address: ${wallet.address},
  message: ${message},
  signature: ${signature}
`;

    await writeFile("download/ETH__MainAdress__output.txt", dataToWrite, "utf8");
    console.log("Data written to output.txt");
}

async function main() {
    await setupDirectory();
    await homeWork_2();
}

main().catch((error) => {
    console.error("Error:", error);
});
