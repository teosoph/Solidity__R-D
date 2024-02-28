import { expect } from 'chai';

describe('Visibility', () => {
  it('Visibility', async () => {
    const c = await ethers.deployContract("contracts/visibility/Visibility.sol:Base");
    // const result = await c.privateFunc(); //this will throw exception, because privateFunc is private
    const result = await c.testPrivateFunc();
    console.log(`\nresult: ${result}\n`);
  });
});
