const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Domain Registry Upgrade", function () {
    let owner, user1, user2, user3, V1, V2, domainRegistry, v1, v2;
    const registrationFee = ethers.parseEther("0.01");
    const validDomains = ["gamma", "delta", "beta", "alpha", "example", "com", "nasa", "gov", "ua"];
    const invalidDomains = [
        "!@#$%^&*()",
        "------",
        "noEndHyphen-",
        "invalid--2",
        "-invalid-",
        "-startHyphen",
        "инвалид",
        "",
        " ",
    ];

    before(async function () {
        [owner, user1, user2, user3] = await ethers.getSigners();
        V1 = await ethers.getContractFactory("DomainRegistryV1");
        V2 = await ethers.getContractFactory("DomainRegistryV2");
    });

    beforeEach(async function () {
        // Deploy a fresh contract before each test
        domainRegistry = await upgrades.deployProxy(V1, [], { initializer: "initialize" });
        console.log("Deployed V1 at:", domainRegistry.target);
    });

    describe("1. Domain Registration", function () {
        it("1.1: should allow an owner to register a valid domain", async function () {
            const domainRegistry = await upgrades.deployProxy(V1, [], { initializer: "initialize" });
            for (const domain of validDomains) {
                await expect(domainRegistry.connect(owner).registerDomain(domain, { value: registrationFee }))
                    .to.emit(domainRegistry, "DomainRegistered")
                    .withArgs(domain, owner.address);
                const actualOwner = await domainRegistry.getDomainOwner(domain);
                expect(actualOwner).to.equal(owner.address);
            }
        });

        it("1.2: should allow non-owner to register a domain with sufficient fee", async function () {
            const domainRegistry = await upgrades.deployProxy(V1, [], { initializer: "initialize" });
            const domainName = validDomains[0];
            await expect(domainRegistry.connect(user2).registerDomain(domainName, { value: registrationFee }))
                .to.emit(domainRegistry, "DomainRegistered")
                .withArgs(domainName, user2.address);
            console.log(`Non-owner ${user2.address} registered domain '${domainName}'`);
        });

        it("1.3: should not allow domain registration with an invalid domain format", async function () {
            const domainRegistry = await upgrades.deployProxy(V1, [], { initializer: "initialize" });
            for (const domain of invalidDomains) {
                await expect(
                    domainRegistry.connect(user2).registerDomain(domain, { value: registrationFee }),
                ).to.be.revertedWithCustomError(domainRegistry, "InvalidDomainFormat");
                console.log(`Attempted registration of invalid domain '${domain}' failed as expected`);
            }
        });

        it("1.4: should register a domain with a valid domain format in V1 and check the same domain in V2", async function () {
            const domainRegistry = await upgrades.deployProxy(V1, [], { initializer: "initialize" });
            const domainName = validDomains[0];
            await expect(domainRegistry.connect(user1).registerDomain(domainName, { value: registrationFee }))
                .to.emit(domainRegistry, "DomainRegistered")
                .withArgs(domainName, user1.address);

            console.log(`User ${user1.address} registered domain '${domainName}' in V1\n`);

            console.log("Original V1 proxy address:", domainRegistry.target);
            const v2 = await upgrades.upgradeProxy(domainRegistry.target, V2);
            console.log("Upgraded to V2 at:", v2.target, "\n");

            expect(await v2.getDomainOwner(domainName)).to.equal(user1.address);
            console.log(`Ownership of domain '${domainName}' confirmed in V2`);

            const newRegistrationFee = ethers.parseEther("0.02");
            await expect(v2.updateRegistrationFee(newRegistrationFee))
                .to.emit(v2, "FeeUpdated")
                .withArgs(newRegistrationFee.toString());

            const updatedFee = await v2.getRegistrationFee();
            console.log(`Registration fee updated in V2 to: ${ethers.formatEther(updatedFee)} ETH`);
            expect(updatedFee).to.equal(newRegistrationFee);
        });
    });

    describe("2. Fee Management", function () {
        beforeEach(async function () {
            // console.log("domainRegistry-----------", domainRegistry);

            // Upgrade to V2 before each fee management test
            v2 = await upgrades.upgradeProxy(domainRegistry.target, V2);
            console.log("Upgraded to V2 at:", v2.target);
        });

        it("2.1: should allow owner to update registration fee in V2", async function () {
            const newRegistrationFee = ethers.parseEther("0.02");
            await expect(v2.updateRegistrationFee(newRegistrationFee))
                .to.emit(v2, "FeeUpdated")
                .withArgs(newRegistrationFee.toString());
        });
        it("2.2: should revert fee update attempts by non-owner accounts in V2", async function () {
            const newFee = ethers.parseEther("0.02");
            console.log(`Attempting to update fee by user: ${user2.address}`);
            const currentOwner = await v2.owner();
            console.log(`Expected owner: ${currentOwner}`);

            await expect(v2.connect(user2).updateRegistrationFee(newFee))
                .to.be.revertedWithCustomError(v2, "OwnableUnauthorizedAccount")
                .withArgs(user2.address);
        });

        it("2.3: should handle fee update values correctly in V2", async function () {
            const lowFee = ethers.parseEther("0.001");
            const highFee = ethers.parseEther("0.9");
            await expect(v2.updateRegistrationFee(lowFee)).to.emit(v2, "FeeUpdated").withArgs(lowFee);
            await expect(v2.updateRegistrationFee(highFee)).to.emit(v2, "FeeUpdated").withArgs(highFee);
        });
    });
});
