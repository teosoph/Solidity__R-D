import { expect } from "chai";
// import pkg from 'hardhat';
// const { ethers, upgrades } = pkg;

describe("SimpleStorageUpgrade", function () {
  it("test", async function () {
    const TokenV1 = await ethers.getContractFactory("TokenV1");
    let token = await upgrades.deployProxy(TokenV1);

    const mintAmount = 10;
    const [owner, addr1] = await ethers.getSigners();
    await token.mint(addr1, mintAmount);
    expect(await token.balanceOf(addr1)).to.equal(mintAmount);

    await token.putToBlacklist(addr1);

    let TokenV2 = await ethers.getContractFactory("TokenV2");
    const address = await token.getAddress();
    token = await upgrades.upgradeProxy(address, TokenV2,
  {
      unsafeSkipStorageCheck: true,
    }
    );
    expect(await token.balanceOf(addr1)).to.equal(mintAmount);

    expect(await token.blacklist(addr1)).to.equal(true);
  });
});
