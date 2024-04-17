const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function calculateStorageLocation(namespace) {
    const abiCoder = new ethers.AbiCoder(); // Создаём экземпляр AbiCoder
    const encoded = abiCoder.encode(["string"], [namespace]); // Кодируем namespace
    const hash = await ethers.keccak256(encoded); // Вычисляем хеш

    const bigIntHash = BigInt(`0x${hash.slice(2)}`); // Преобразуем хеш в BigInt
    const offsetHash = await ethers.keccak256(abiCoder.encode(["uint256"], [bigIntHash - 1n])); // Вычисляем смещённый хеш

    // Вычисляем слот, обнуляя последний байт
    const slot = `0x${(
        BigInt(`0x${offsetHash.slice(2)}`) &
        BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00")
    ).toString(16)}`;
    console.log(`Storage slot for ${namespace}: ${slot}`);

    // Путь к директории и файлу
    const directoryPath = path.join(__dirname, "tokens");
    const filePath = path.join(directoryPath, "StorageLocationToken.json");

    // Проверяем, существует ли папка, и создаём её при необходимости
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
    }

    // Сохраняем данные в файл
    const data = JSON.stringify({ namespace, slot }, null, 2);
    fs.writeFileSync(filePath, data);
    console.log("Data written to file");
}

calculateStorageLocation("domainRegistry.storage");
