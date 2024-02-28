import { expect } from "chai";

describe('Modifier', () => {
  it('Modifier', async () => {
    const c = await ethers.deployContract("FunctionModifier");
    await c.setX(20);
    const result = await c.x();
    console.log(`\nresult: ${result}\n`);

    const [oldOwner, newOwner] = await ethers.getSigners()
    await c.changeOwner(newOwner.address);
    await c.connect(newOwner).setX(30);
    const result2 = await c.x();
    console.log(`\nresult2: ${result2}\n`);

    await expect(c.connect(oldOwner).setX(40)).to.be.revertedWith("Not owner");
  });
});
