const { expect } = require("chai");
const { upgrades } = require("@nomiclabs/hardhat-upgrades");

describe("DomainRegistry", function () {
    let domainRegistry;
    let deployer, user;
    let registrationFee; // Будет хранить текущую сумму регистрационного взноса

    beforeEach(async function () {
        [deployer, user] = await ethers.getSigners();
        const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
        domainRegistry = await upgrades.deployProxy(DomainRegistry, [], { initializer: "initialize" });
        await domainRegistry.deployed();

        // Получаем текущую сумму регистрационного взноса из контракта
        registrationFee = await domainRegistry.registrationFee();
    });

    it("1.1: should allow a user to register a valid domain", async function () {
        const domainName = "example.com";

        // Используем точную сумму регистрационного взноса при регистрации домена
        await expect(domainRegistry.connect(user).registerDomain(domainName, { value: registrationFee }))
            .to.emit(domainRegistry, "DomainRegistered")
            .withArgs(domainName, user.address);

        // Дополнительные проверки могут быть добавлены здесь, например, проверка владельца домена
    });
});
