import { expect } from "chai";

describe("Library", function () {
  it("ClientOfLibraryWithInternalFunctions", async function () {
    const client = await ethers.deployContract("ClientOfLibraryWithInternalFunctions");

    const x = 25;
    const expected = 5;
    const result = await client.getSquareRoot(x);
    expect(result).to.equal(expected);
  });

  it("ClientOfLibraryWithPublicFunctions", async function () {
    const mathUtils = await ethers.deployContract("contracts/LibraryWithPublicFunctions.sol:MathUtils");

    const client = await ethers.deployContract("ClientOfLibraryWithPublicFunctions", {
      libraries: {
        MathUtils: mathUtils
      }
    });

    const x = 25;
    const expected = 5;
    const result = await client.getSquareRoot(x);
    expect(result).to.equal(expected);
  });
});
