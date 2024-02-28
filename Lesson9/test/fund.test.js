import pkg from 'hardhat';
const { ethers } = pkg;
import { expect } from 'chai';

describe('Fund', () => {
  it('Attack the fund', async () => {
    const fund = await ethers.deployContract('Fund');
    const attacker = await ethers.deployContract('Attacker', [fund]);
    const [addr1, addr2] = await ethers.getSigners();

    await fund.connect(addr1).deposit({ value: 1000 });
    await fund.connect(addr2).deposit({ value: 2000 });
    // await fund.connect(addr2).deposit({ value: 20000 });
    await attacker.depositToFund({ value: 100 });

    expect(await fund.shares(attacker)).to.equal(100);

    // ATTACK!!!
    console.log("Fund's balance before attack: ", await ethers.provider.getBalance(fund));
    console.log("Attacker's balance before attack: ", await ethers.provider.getBalance(attacker));
    await attacker.attack({ gasLimit: 30000000 });
    console.log("\nFund's balance after attack: ", await ethers.provider.getBalance(fund));
    console.log("Attacker's balance after attack: ", await ethers.provider.getBalance(attacker));
  });
});
