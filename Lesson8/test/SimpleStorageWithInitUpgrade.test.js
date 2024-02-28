import { expect } from "chai";
// import pkg from 'hardhat';
// const { ethers, upgrades } = pkg;

describe("SimpleStorageUpgrade", function () {
  it("test", async function () {
    const Contract = await ethers.getContractFactory("SimpleStorageWithInitV1");
    let contract = await upgrades.deployProxy(Contract, [100]);

    expect(await contract.get()).to.equal(100);

    let ContractV2 = await ethers.getContractFactory("SimpleStorageWithInitV2");
    const address = await contract.getAddress();

    contract = await upgrades.upgradeProxy(address, ContractV2, {call: {
      fn: "reinitialize",
      args: [200],
      //   fn: "set",
      //   args: [200],
    }});
    expect(await contract.get()).to.equal(200);

    await contract.set(201);
    expect(await contract.get()).to.equal(201);

    await contract.set2(301);
    expect(await contract.get2()).to.equal(301);
  });
});
