const { expect } = require("chai");

describe("DomainRegistry", function () {
    let domainRegistry;
    let owner, addr1, addr2;
    const registrationFee = ethers.utils.parseEther("0.01");
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

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
        domainRegistry = await DomainRegistry.deploy();
    });

    const registerDomain = async (signer, domainName, withDelay = false) => {
        if (withDelay) {
            const delay = Math.floor(Math.random() * 5000) + 1000; // Random delay between 1 and 5 seconds
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
        return await domainRegistry.connect(signer).registerDomain(domainName, { value: registrationFee });
    };

    describe("1. Domain Registration", function () {
        it("1.1: should allow a user to register a valid domain", async function () {
            for (const domain of validDomains) {
                await registerDomain(owner, domain);
                const domainOwner = await domainRegistry.getDomainOwner(domain);
                expect(domainOwner).to.equal(owner.address);
            }
        });

        it("1.2: should not allow domain registration with an invalid domain format", async function () {
            for (const domain of invalidDomains) {
                await expect(registerDomain(owner, domain)).to.be.revertedWithCustomError(
                    domainRegistry,
                    "InvalidDomainFormat",
                );
            }
        });

        it("1.3: should allow non-owner to register a domain with sufficient fee", async function () {
            const [_, nonOwner] = await ethers.getSigners();
            const domainName = validDomains[0];
            const tx = await domainRegistry.connect(nonOwner).registerDomain(domainName, { value: registrationFee });
            const receipt = await tx.wait();
            const event = receipt.events.find((e) => e.event === "DomainRegistered");

            expect(event.args.domainName).to.equal(domainName);
            expect(event.args.owner).to.equal(nonOwner.address);
        });
    });

    describe("2. Ownership  and  Fee Management ", function () {
        it("2.1: should return the correct owner of a domain", async function () {
            const domain = validDomains[0];
            await registerDomain(owner, domain, false);
            const domainOwner = await domainRegistry.getDomainOwner(domain);
            expect(domainOwner).to.equal(owner.address);
            console.log(`Owner of domain "${domain}" is ${domainOwner}`);
        });

        it("2.2: should allow owner to update registration fee", async function () {
            const newFee = ethers.utils.parseEther("0.02").toString();
            await domainRegistry.updateRegistrationFee(newFee);

            const updatedFee = (await domainRegistry.registrationFee()).toString();
            expect(updatedFee).to.equal(newFee);

            const someOtherAccount = (await ethers.getSigners())[1];

            await expect(
                domainRegistry.connect(someOtherAccount).updateRegistrationFee(registrationFee),
            ).to.be.revertedWithCustomError(domainRegistry, "OnlyOwnerAllowed");
        });

        it("2.3: should revert fee update attempts by non-owner accounts", async function () {
            const newFee = ethers.utils.parseEther("0.02");
            const nonOwner = (await ethers.getSigners())[1];

            await expect(domainRegistry.connect(nonOwner).updateRegistrationFee(newFee)).to.be.revertedWithCustomError(
                domainRegistry,
                "OnlyOwnerAllowed",
            );
        });

        it("2.4: should handle fee update values correctly", async function () {
            const extremeLowFee = ethers.utils.parseEther("0");
            const lowFee = ethers.utils.parseEther("0.001");
            const highFee = ethers.utils.parseEther("0.9");
            const extremeHighFee = ethers.utils.parseEther("10000");

            await expect(domainRegistry.updateRegistrationFee(extremeLowFee)).to.be.revertedWithCustomError(
                domainRegistry,
                "FeeCannotBeNegativeOrZero",
            );

            await expect(domainRegistry.updateRegistrationFee(lowFee))
                .to.emit(domainRegistry, "FeeUpdated")
                .withArgs(lowFee);

            await expect(domainRegistry.updateRegistrationFee(highFee))
                .to.emit(domainRegistry, "FeeUpdated")
                .withArgs(highFee);

            await expect(domainRegistry.updateRegistrationFee(extremeHighFee)).to.be.revertedWithCustomError(
                domainRegistry,
                "FeeExceedsMaximumAllowed",
            );
        });
    });

    describe("3. Metrics, Sorting, and Domain Retrieval", function () {
        let accounts;

        beforeEach(async function () {
            accounts = await ethers.getSigners();
        });

        it("3.1: should calculate the total number of registered domains", async function () {
            for (const [index, domain] of validDomains.entries()) {
                const signer = accounts[index % 3];
                await registerDomain(signer, domain, false);
            }

            const filter = domainRegistry.filters.DomainRegistered();
            const events = await domainRegistry.queryFilter(filter);

            expect(events.length).to.equal(validDomains.length);

            const totalRegistered = await domainRegistry.totalDomainsRegistered();
            expect(totalRegistered).to.equal(validDomains.length);

            console.log(`Total domains registered in contract: ${totalRegistered} and in this test: ${events.length}`);
        });

        it("3.2: should sort and list all registered domains by registration date", async function () {
            for (const [index, domain] of validDomains.entries()) {
                const signer = accounts[index % 3];
                await registerDomain(signer, domain, true);
            }

            const filter = domainRegistry.filters.DomainRegistered();
            const events = await domainRegistry.queryFilter(filter);

            const sortedDomains = await Promise.all(
                events.map(async (event) => {
                    const block = await ethers.provider.getBlock(event.blockNumber);
                    return { domainName: event.args.domainName, timestamp: block.timestamp };
                }),
            );

            sortedDomains.sort((a, b) => a.timestamp - b.timestamp);

            console.log("All domains sorted by registration date:");
            sortedDomains.forEach((reg) => {
                console.log(`${reg.domainName}: registered at ${new Date(reg.timestamp * 1000).toLocaleString()}`);
            });
        });

        it("3.3: should list domains registered by a specific controller, sorted by registration date", async function () {
            for (let i = 0; i < validDomains.length; i++) {
                const signer = accounts[i % 3];
                const domainName = validDomains[i];
                await registerDomain(signer, domainName, true);
            }

            const specificControllerIndex = Math.floor(Math.random() * 3);
            const specificController = accounts[specificControllerIndex];

            const filter = domainRegistry.filters.DomainRegistered(null, specificController.address);
            const events = await domainRegistry.queryFilter(filter);

            const registrations = await Promise.all(
                events.map(async (event) => {
                    const block = await ethers.provider.getBlock(event.blockHash);
                    return {
                        domainName: event.args.domainName,
                        timestamp: block.timestamp,
                    };
                }),
            );

            registrations.sort((a, b) => a.timestamp - b.timestamp);

            console.log(`Domains registered by controller ${specificController.address}, sorted by registration date:`);
            registrations.forEach((reg) => {
                console.log(`${reg.domainName}: registered at ${new Date(reg.timestamp * 1000).toLocaleString()}`);
            });
        });

        it("3.4: should list domains registered by multiple controllers and sort them by registration date", async function () {
            const domainRegistrations = [];
            for (let i = 0; i < validDomains.length; i++) {
                const signer = accounts[i % accounts.length];
                const domainName = validDomains[i];
                const tx = await registerDomain(signer, domainName, true);
                const receipt = await tx.wait();
                const block = await ethers.provider.getBlock(receipt.blockNumber);
                domainRegistrations.push({
                    domainName,
                    owner: signer.address,
                    timestamp: block.timestamp,
                });
            }

            domainRegistrations.sort((a, b) => a.timestamp - b.timestamp);

            domainRegistrations.forEach((reg) => {
                console.log(
                    `${reg.domainName}: registered by ${reg.owner} at ${new Date(
                        reg.timestamp * 1000,
                    ).toLocaleString()}`,
                );
            });

            expect(domainRegistrations.length).to.equal(validDomains.length);
        });

        it("3.5: should list all registered domains correctly using pagination", async function () {
            // Register some domains
            for (const domain of validDomains) {
                await registerDomain(owner, domain);
                console.log(`Domain registered: ${domain}`);
            }

            // Assume totalDomainsRegistered is updated correctly upon each registration
            const totalRegistered = await domainRegistry.totalDomainsRegistered();
            const pageSize = 5; // Define a page size
            let allDomains = [];

            // Fetch domains in pages
            for (let i = 0; i < totalRegistered; i += pageSize) {
                const domains = await domainRegistry.getDomainNamesByIndex(i, Math.min(i + pageSize, totalRegistered));
                allDomains = [...allDomains, ...domains];
            }

            // Log and test
            console.log(`Registered domains fetched by pagination: ${allDomains.join(", ")}`);
            expect(allDomains.length).to.equal(validDomains.length);
            expect(allDomains).to.include.members(validDomains); // Ensure all registered domains are included
        });
    });

    describe("4. Domain Length Restrictions", function () {
        it("4.1: should enforce minimum and maximum domain name length", async function () {
            const MIN_DOMAIN_LENGTH = 1;
            const MAX_DOMAIN_LENGTH = 63;

            const minDomain = "a".repeat(MIN_DOMAIN_LENGTH);
            const maxDomain = "b".repeat(MAX_DOMAIN_LENGTH);
            await expect(registerDomain(owner, minDomain, false)).to.emit(domainRegistry, "DomainRegistered");
            await expect(registerDomain(owner, maxDomain, false)).to.emit(domainRegistry, "DomainRegistered");

            const overMinDomain = "a".repeat(MIN_DOMAIN_LENGTH - 1);
            const overMaxDomain = "b".repeat(MAX_DOMAIN_LENGTH + 1);
            await expect(registerDomain(owner, overMinDomain)).to.be.revertedWithCustomError(
                domainRegistry,
                "InvalidDomainFormat",
            );
            await expect(registerDomain(owner, overMaxDomain)).to.be.revertedWithCustomError(
                domainRegistry,
                "InvalidDomainFormat",
            );
        });
    });

    describe("5. Ether Amount Checks and Validations ", function () {
        it("5.1: should reject registration with insufficient ether", async function () {
            const insufficientFee = registrationFee.sub(ethers.utils.parseUnits("0.0001", "ether"));
            await expect(
                domainRegistry.connect(owner).registerDomain(validDomains[0], { value: insufficientFee }),
            ).to.be.revertedWithCustomError(domainRegistry, "IncorrectRegistrationFee");
        });

        it("5.2: should reject registration with excessive ether", async function () {
            const excessiveFee = registrationFee.add(ethers.utils.parseUnits("0.1", "ether"));
            await expect(
                domainRegistry.connect(owner).registerDomain(validDomains[0], { value: excessiveFee }),
            ).to.be.revertedWithCustomError(domainRegistry, "IncorrectRegistrationFee");
        });

        it("5.3: should accept registration with exact registration fee", async function () {
            const [_, nonOwner] = await ethers.getSigners();
            const domainName = validDomains[Math.floor(Math.random() * validDomains.length)];
            const tx = await domainRegistry.connect(nonOwner).registerDomain(domainName, { value: registrationFee });
            const receipt = await tx.wait();
            const event = receipt.events.find((e) => e.event === "DomainRegistered");

            expect(event.args.domainName).to.equal(domainName);
            expect(event.args.owner).to.equal(nonOwner.address);

            const block = await ethers.provider.getBlock(receipt.blockNumber);

            expect(block.timestamp).to.be.a("number").that.is.greaterThan(0);
        });

        it("5.4: should reject registration with more than required registration fee", async function () {
            const [_, nonOwner] = await ethers.getSigners();
            const domainName = validDomains[Math.floor(Math.random() * validDomains.length)];
            const excessiveFee = registrationFee.add(ethers.utils.parseUnits("0.001", "ether"));
            await expect(
                domainRegistry.connect(owner).registerDomain(validDomains[0], { value: excessiveFee }),
            ).to.be.revertedWithCustomError(domainRegistry, "IncorrectRegistrationFee");
        });

        it("5.5: should reject registration with less than required registration fee by a tiny amount", async function () {
            const [_, nonOwner] = await ethers.getSigners();
            const domainName = validDomains[Math.floor(Math.random() * validDomains.length)];
            const slightlyLessFee = registrationFee.sub(ethers.utils.parseUnits("0.0001", "ether"));
            await expect(
                domainRegistry.connect(nonOwner).registerDomain(domainName, { value: slightlyLessFee }),
            ).to.be.revertedWithCustomError(domainRegistry, "IncorrectRegistrationFee");
        });
    });

    describe("6. Domain Re-registration", function () {
        it("6.1: should reject registration of a domain already registered by another user", async function () {
            const [owner, anotherOwner] = await ethers.getSigners();
            const domainName = validDomains[0];

            await registerDomain(owner, domainName, false);

            await expect(registerDomain(anotherOwner, domainName)).to.be.revertedWithCustomError(
                domainRegistry,
                "DomainAlreadyRegistered",
            );
        });
    });

    describe("7. Event Checks", function () {
        it("7.1: should emit DomainRegistered on domain registration", async function () {
            const [owner] = await ethers.getSigners();

            const domainName = validDomains[0];
            await expect(registerDomain(owner, domainName)).to.emit(domainRegistry, "DomainRegistered");
        });

        it("7.2: should emit FeeUpdated on registration fee update", async function () {
            const newFee = ethers.utils.parseEther("0.02");
            await expect(domainRegistry.updateRegistrationFee(newFee))
                .to.emit(domainRegistry, "FeeUpdated")
                .withArgs(newFee);
        });
    });

    describe("8. Ether Transfer on Domain Registration", function () {
        it("8.1: should transfer registration fee to contract owner upon domain registration", async function () {
            const [_, secondAccount] = await ethers.getSigners();
            const domainName = validDomains[0];

            console.log("Contract owner address:", owner.address);
            console.log("Second account address:", secondAccount.address);

            const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
            console.log("Owner balance before domain registration:", ownerBalanceBefore.toString());

            const tx = await domainRegistry
                .connect(secondAccount)
                .registerDomain(domainName, { value: registrationFee });
            await tx.wait();

            const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
            console.log("Owner balance after domain registration:", ownerBalanceAfter.toString());

            const balanceDifference = ownerBalanceAfter.sub(ownerBalanceBefore);
            console.log(
                "Difference in owner balance (should match the registration fee):",
                balanceDifference.toString(),
            );

            expect(balanceDifference).to.equal(registrationFee);
        });
    });
});
