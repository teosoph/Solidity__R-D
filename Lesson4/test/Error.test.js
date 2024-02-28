import { expect } from 'chai';

describe('ErrorContract', () => {
  let errorContract;

  before(async () => {
    errorContract = await ethers.deployContract("ErrorContract");
  });

  it('Should test require function', async () => {
    await expect(errorContract.testRequire(9)).to.be.rejectedWith(
      "Input must be greater than 10"
    );
  });

  it("should test revert function", async function () {
    await expect(errorContract.testRevert(5)).to.be.rejectedWith(
      "Input must be greater than 10"
    );
  });

  it("should test assert function", async function () {
    await expect(errorContract.testAssert()).to.be.fulfilled;
  });

  it("should test custom error function", async function () {
    const balance = await ethers.provider.getBalance(await errorContract.getAddress());

    const withdrawalAmount = balance + 1n;
    await expect(errorContract.testCustomError(withdrawalAmount)).to.be.rejectedWith(
      "InsufficientBalance"
    );
  });
});
