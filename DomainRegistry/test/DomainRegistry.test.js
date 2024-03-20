const { expect } = require("chai");

describe("DomainRegistry", function () {
    let domainRegistry, owner;
    const registrationFee = ethers.utils.parseEther("0.01");
    const validDomains = ["gamma", "delta", "beta", "alpha", "example", "com"];
    const invalidDomains = [
        "!@#$%^&*()",
        "------",
        "noEndHyphen-",
        "invalid--2",
        "-invalid-",
        "-startHyphen",
        "инвалид3",
        "",
        " ",
    ];

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
        domainRegistry = await DomainRegistry.deploy();
    });

    const registerDomain = async (domainName, withDelay = false) => {
        if (withDelay) {
            const getRandomDelay = () => Math.floor(Math.random() * (2500 - 500 + 1) + 500);
            await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
        }
        return domainRegistry.connect(owner).registerDomain(domainName, { value: registrationFee });
    };

    describe("1. Domain Registration", function () {
        xit("1.1: should allow a user to register a valid domain", async function () {
            for (const domain of validDomains) {
                await registerDomain(domain);
                const domainOwner = await domainRegistry.getDomainOwner(domain);
                expect(domainOwner).to.equal(owner.address);
            }
        });

        xit("1.2: should not allow domain registration with an invalid domain format", async function () {
            for (const domain of invalidDomains) {
                await expect(registerDomain(domain)).to.be.revertedWith("Invalid domain format");
            }
        });
    });

    describe("2. Ownership  and  Fee Management ", function () {
        xit("2.1: should return the correct owner of a domain", async function () {
            const domain = validDomains[0];
            await registerDomain(domain);
            const domainOwner = await domainRegistry.getDomainOwner(domain);
            expect(domainOwner).to.equal(owner.address);
            console.log(`Owner of domain "${domain}" is ${domainOwner}`);
        });

        xit("2.2: should allow owner to update registration fee", async function () {
            const newFee = ethers.utils.parseEther("0.02").toString();
            await domainRegistry.updateRegistrationFee(newFee);

            const updatedFee = (await domainRegistry.registrationFee()).toString();
            expect(updatedFee).to.equal(newFee);

            const someOtherAccount = (await ethers.getSigners())[1];
            await expect(
                domainRegistry.connect(someOtherAccount).updateRegistrationFee(registrationFee),
            ).to.be.revertedWith("Caller is not the owner");
        });

        xit("2.3: should revert fee update attempts by non-owner accounts", async function () {
            const newFee = ethers.utils.parseEther("0.02");
            const nonOwner = (await ethers.getSigners())[1];
            await expect(domainRegistry.connect(nonOwner).updateRegistrationFee(newFee)).to.be.revertedWith(
                "Caller is not the owner",
            );
        });

        xit("2.3: should handle extreme fee update values correctly", async function () {
            const extremeLowFee = ethers.utils.parseEther("0");
            const extremeHighFee = ethers.utils.parseEther("10000");

            await expect(domainRegistry.updateRegistrationFee(extremeLowFee))
                .to.emxit(domainRegistry, "FeeUpdated")
                .withArgs(extremeLowFee);

            await expect(domainRegistry.updateRegistrationFee(extremeHighFee))
                .to.emxit(domainRegistry, "FeeUpdated")
                .withArgs(extremeHighFee);
        });
    });

    describe("Metrics, Sorting, and Domain Retrieval", function () {
        xit("3.1: should sort domains by registration date for the same owner", async function () {
            let domainRegistrations = [];
            for (const domain of validDomains) {
                await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * (2500 - 500 + 1) + 500)));
                const tx = await registerDomain(domain, false);
                const receipt = await tx.waxit();
                const event = receipt.events.find((e) => e.event === "DomainRegistered");
                domainRegistrations.push({
                    domainName: domain,
                    timestamp: event.args.timestamp.toNumber(),
                });
            }
            domainRegistrations.sort((a, b) => a.timestamp - b.timestamp);
            domainRegistrations.forEach((reg) =>
                console.log(
                    `Domain name "${reg.domainName}" registered at ${new Date(reg.timestamp * 1000).toLocaleString()}`,
                ),
            );
        });
        xit("3.2: should list domains registered by a specific owner, sorted by name", async function () {
            let domainDetails = [];
            for (const domain of validDomains) {
                await registerDomain(domain);
                const details = await domainRegistry.getDomainDetails(domain);
                domainDetails.push({ name: domain, registrationDate: details.registrationDate });
            }
            domainDetails.sort((a, b) => a.name.localeCompare(b.name));
            console.log("Domains sorted by name:");
            domainDetails.forEach((domain) =>
                console.log(
                    `Domain name "${domain.name}" registered at ${new Date(
                        domain.registrationDate * 1000,
                    ).toLocaleString()}`,
                ),
            );
        });

        xit("3.3: should correctly retrieve domains and their count for an owner address", async function () {
            for (const domain of validDomains) {
                await registerDomain(domain);
            }
            const [count, domains] = await domainRegistry.getDomainsByOwner(owner.address);
            expect(count).to.equal(validDomains.length);
            console.log(`Total domains registered by the owner (${owner.address}): ${count}`);
            console.log("List of registered domains:", domains.join(", "));
        });
        xit("3.4: should retrieve all registered domains without sorting", async function () {
            for (const domain of validDomains) {
                await registerDomain(domain, false);
            }

            const allDomains = await domainRegistry.getAllRegisteredDomains();
            console.log("All registered domains:", allDomains);
            expect(allDomains.length).to.equal(validDomains.length);

            for (const domain of validDomains) {
                expect(allDomains).to.include(domain);
            }
        });
    });

    describe("4. Domain Length Restrictions", function () {
        xit("4.1: should enforce minimum and maximum domain name length", async function () {
            const MIN_DOMAIN_LENGTH = 1;
            const MAX_DOMAIN_LENGTH = 63;

            const minDomain = "a".repeat(MIN_DOMAIN_LENGTH);
            const maxDomain = "b".repeat(MAX_DOMAIN_LENGTH);
            await expect(registerDomain(minDomain)).to.emxit(domainRegistry, "DomainRegistered");
            await expect(registerDomain(maxDomain)).to.emxit(domainRegistry, "DomainRegistered");

            const overMinDomain = "a".repeat(MIN_DOMAIN_LENGTH - 1);
            const overMaxDomain = "b".repeat(MAX_DOMAIN_LENGTH + 1);
            await expect(registerDomain(overMinDomain)).to.be.revertedWith("Invalid domain format");
            await expect(registerDomain(overMaxDomain)).to.be.revertedWith("Invalid domain format");
        });
    });

    describe("5. Ether Amount Checks", function () {
        xit("5.1: should reject registration with insufficient ether", async function () {
            const insufficientFee = registrationFee.sub(ethers.utils.parseUnits("0.0001", "ether"));
            await expect(
                domainRegistry.connect(owner).registerDomain(validDomains[0], { value: insufficientFee }),
            ).to.be.revertedWith("Incorrect registration fee");
        });

        xit("5.2: should reject registration with excessive ether", async function () {
            const excessiveFee = registrationFee.add(ethers.utils.parseUnits("0.1", "ether"));
            await expect(
                domainRegistry.connect(owner).registerDomain(validDomains[0], { value: excessiveFee }),
            ).to.be.revertedWith("Incorrect registration fee");
        });
    });

    describe("6. Domain Re-registration", function () {
        xit("6.1: should reject registration of a domain already registered by another user", async function () {
            await registerDomain(validDomains[0]);
            const anotherOwner = (await ethers.getSigners())[1];
            await expect(registerDomain(validDomains[0], false, registrationFee, anotherOwner)).to.be.revertedWith(
                "Domain is already registered",
            );
        });
    });

    describe("7. Event Checks", function () {
        xit("7.1: should emit DomainRegistered on domain registration", async function () {
            const domainName = validDomains[0];
            await expect(registerDomain(domainName)).to.emxit(domainRegistry, "DomainRegistered");
        });

        xit("7.2: should emit FeeUpdated on registration fee update", async function () {
            const newFee = ethers.utils.parseEther("0.02");
            await expect(domainRegistry.updateRegistrationFee(newFee))
                .to.emxit(domainRegistry, "FeeUpdated")
                .withArgs(newFee);
        });
    });

    // describe("8. Ether Transfer on Domain Registration", function () {
    //     it("8.1: should transfer registration fee to contract owner upon domain registration", async function () {
    //         const domainName = validDomains[0];
    //         const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
    //         console.log("Owner balance before domain registration:", ownerBalanceBefore.toString());

    //         const tx = await registerDomain(domainName, { value: registrationFee });
    //         const receipt = await tx.wait();
    //         const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    //         const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
    //         console.log("Owner balance after domain registration:", ownerBalanceAfter.toString());

    //         const feeDifference = ownerBalanceAfter.sub(ownerBalanceBefore).add(gasUsed);
    //         expect(feeDifference).to.equal(registrationFee, "Incorrect registration fee transfer");
    //         console.log("Difference in owner balance:", feeDifference.toString());
    //     });
    // });

    const { expect } = require("chai");

    describe("DomainRegistry", function () {
        let domainRegistry, owner;
        const registrationFee = ethers.utils.parseEther("0.01");
        const validDomains = ["gamma", "delta", "beta", "alpha", "example", "com"];
        const invalidDomains = [
            "!@#$%^&*()",
            "------",
            "noEndHyphen-",
            "invalid--2",
            "-invalid-",
            "-startHyphen",
            "инвалид3",
            "",
            " ",
        ];

        beforeEach(async function () {
            [owner] = await ethers.getSigners();
            const DomainRegistry = await ethers.getContractFactory("DomainRegistry");
            domainRegistry = await DomainRegistry.deploy();
        });

        const registerDomain = async (domainName, withDelay = false) => {
            if (withDelay) {
                const getRandomDelay = () => Math.floor(Math.random() * (2500 - 500 + 1) + 500);
                await new Promise((resolve) => setTimeout(resolve, getRandomDelay()));
            }
            return domainRegistry.connect(owner).registerDomain(domainName, { value: registrationFee });
        };

        describe("1. Domain Registration", function () {
            xit("1.1: should allow a user to register a valid domain", async function () {
                for (const domain of validDomains) {
                    await registerDomain(domain);
                    const domainOwner = await domainRegistry.getDomainOwner(domain);
                    expect(domainOwner).to.equal(owner.address);
                }
            });

            xit("1.2: should not allow domain registration with an invalid domain format", async function () {
                for (const domain of invalidDomains) {
                    await expect(registerDomain(domain)).to.be.revertedWith("Invalid domain format");
                }
            });
        });

        describe("2. Ownership  and  Fee Management ", function () {
            xit("2.1: should return the correct owner of a domain", async function () {
                const domain = validDomains[0];
                await registerDomain(domain);
                const domainOwner = await domainRegistry.getDomainOwner(domain);
                expect(domainOwner).to.equal(owner.address);
                console.log(`Owner of domain "${domain}" is ${domainOwner}`);
            });

            xit("2.2: should allow owner to update registration fee", async function () {
                const newFee = ethers.utils.parseEther("0.02").toString();
                await domainRegistry.updateRegistrationFee(newFee);

                const updatedFee = (await domainRegistry.registrationFee()).toString();
                expect(updatedFee).to.equal(newFee);

                const someOtherAccount = (await ethers.getSigners())[1];
                await expect(
                    domainRegistry.connect(someOtherAccount).updateRegistrationFee(registrationFee),
                ).to.be.revertedWith("Caller is not the owner");
            });

            xit("2.3: should revert fee update attempts by non-owner accounts", async function () {
                const newFee = ethers.utils.parseEther("0.02");
                const nonOwner = (await ethers.getSigners())[1];
                await expect(domainRegistry.connect(nonOwner).updateRegistrationFee(newFee)).to.be.revertedWith(
                    "Caller is not the owner",
                );
            });

            xit("2.3: should handle extreme fee update values correctly", async function () {
                const extremeLowFee = ethers.utils.parseEther("0");
                const extremeHighFee = ethers.utils.parseEther("10000");

                await expect(domainRegistry.updateRegistrationFee(extremeLowFee))
                    .to.emxit(domainRegistry, "FeeUpdated")
                    .withArgs(extremeLowFee);

                await expect(domainRegistry.updateRegistrationFee(extremeHighFee))
                    .to.emxit(domainRegistry, "FeeUpdated")
                    .withArgs(extremeHighFee);
            });
        });

        describe("Metrics, Sorting, and Domain Retrieval", function () {
            xit("3.1: should sort domains by registration date for the same owner", async function () {
                let domainRegistrations = [];
                for (const domain of validDomains) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, Math.floor(Math.random() * (2500 - 500 + 1) + 500)),
                    );
                    const tx = await registerDomain(domain, false);
                    const receipt = await tx.waxit();
                    const event = receipt.events.find((e) => e.event === "DomainRegistered");
                    domainRegistrations.push({
                        domainName: domain,
                        timestamp: event.args.timestamp.toNumber(),
                    });
                }
                domainRegistrations.sort((a, b) => a.timestamp - b.timestamp);
                domainRegistrations.forEach((reg) =>
                    console.log(
                        `Domain name "${reg.domainName}" registered at ${new Date(
                            reg.timestamp * 1000,
                        ).toLocaleString()}`,
                    ),
                );
            });
            xit("3.2: should list domains registered by a specific owner, sorted by name", async function () {
                let domainDetails = [];
                for (const domain of validDomains) {
                    await registerDomain(domain);
                    const details = await domainRegistry.getDomainDetails(domain);
                    domainDetails.push({ name: domain, registrationDate: details.registrationDate });
                }
                domainDetails.sort((a, b) => a.name.localeCompare(b.name));
                console.log("Domains sorted by name:");
                domainDetails.forEach((domain) =>
                    console.log(
                        `Domain name "${domain.name}" registered at ${new Date(
                            domain.registrationDate * 1000,
                        ).toLocaleString()}`,
                    ),
                );
            });

            xit("3.3: should correctly retrieve domains and their count for an owner address", async function () {
                for (const domain of validDomains) {
                    await registerDomain(domain);
                }
                const [count, domains] = await domainRegistry.getDomainsByOwner(owner.address);
                expect(count).to.equal(validDomains.length);
                console.log(`Total domains registered by the owner (${owner.address}): ${count}`);
                console.log("List of registered domains:", domains.join(", "));
            });
            xit("3.4: should retrieve all registered domains without sorting", async function () {
                for (const domain of validDomains) {
                    await registerDomain(domain, false);
                }

                const allDomains = await domainRegistry.getAllRegisteredDomains();
                console.log("All registered domains:", allDomains);
                expect(allDomains.length).to.equal(validDomains.length);

                for (const domain of validDomains) {
                    expect(allDomains).to.include(domain);
                }
            });
        });

        describe("4. Domain Length Restrictions", function () {
            xit("4.1: should enforce minimum and maximum domain name length", async function () {
                const MIN_DOMAIN_LENGTH = 1;
                const MAX_DOMAIN_LENGTH = 63;

                const minDomain = "a".repeat(MIN_DOMAIN_LENGTH);
                const maxDomain = "b".repeat(MAX_DOMAIN_LENGTH);
                await expect(registerDomain(minDomain)).to.emxit(domainRegistry, "DomainRegistered");
                await expect(registerDomain(maxDomain)).to.emxit(domainRegistry, "DomainRegistered");

                const overMinDomain = "a".repeat(MIN_DOMAIN_LENGTH - 1);
                const overMaxDomain = "b".repeat(MAX_DOMAIN_LENGTH + 1);
                await expect(registerDomain(overMinDomain)).to.be.revertedWith("Invalid domain format");
                await expect(registerDomain(overMaxDomain)).to.be.revertedWith("Invalid domain format");
            });
        });

        describe("5. Ether Amount Checks", function () {
            xit("5.1: should reject registration with insufficient ether", async function () {
                const insufficientFee = registrationFee.sub(ethers.utils.parseUnits("0.0001", "ether"));
                await expect(
                    domainRegistry.connect(owner).registerDomain(validDomains[0], { value: insufficientFee }),
                ).to.be.revertedWith("Incorrect registration fee");
            });

            xit("5.2: should reject registration with excessive ether", async function () {
                const excessiveFee = registrationFee.add(ethers.utils.parseUnits("0.1", "ether"));
                await expect(
                    domainRegistry.connect(owner).registerDomain(validDomains[0], { value: excessiveFee }),
                ).to.be.revertedWith("Incorrect registration fee");
            });
        });

        describe("6. Domain Re-registration", function () {
            xit("6.1: should reject registration of a domain already registered by another user", async function () {
                await registerDomain(validDomains[0]);
                const anotherOwner = (await ethers.getSigners())[1];
                await expect(registerDomain(validDomains[0], false, registrationFee, anotherOwner)).to.be.revertedWith(
                    "Domain is already registered",
                );
            });
        });

        describe("7. Event Checks", function () {
            xit("7.1: should emit DomainRegistered on domain registration", async function () {
                const domainName = validDomains[0];
                await expect(registerDomain(domainName)).to.emxit(domainRegistry, "DomainRegistered");
            });

            xit("7.2: should emit FeeUpdated on registration fee update", async function () {
                const newFee = ethers.utils.parseEther("0.02");
                await expect(domainRegistry.updateRegistrationFee(newFee))
                    .to.emxit(domainRegistry, "FeeUpdated")
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
});
