import { expect } from "chai";
// import pkg from 'hardhat';
// const { ethers, upgrades } = pkg;

describe("SimpleStorageUpgrade", function () {
  it("test", async function () {
    const Contract = await ethers.getContractFactory("SimpleStorageV1");
    let contract = await upgrades.deployProxy(Contract);

    await contract.set(10);
    expect(await contract.get()).to.equal(10);

    let ContractV2 = await ethers.getContractFactory("SimpleStorageV2");
    const address = await contract.getAddress();

    // const [owner, addr1] = await ethers.getSigners();
    // ContractV2 = ContractV2.connect(addr1);

    contract = await upgrades.upgradeProxy(address, ContractV2);
    expect(await contract.get()).to.equal(10);

    await contract.set(20);
    expect(await contract.get()).to.equal(20);

    await contract.set2(100);
    expect(await contract.get2()).to.equal(100);
  });
});
