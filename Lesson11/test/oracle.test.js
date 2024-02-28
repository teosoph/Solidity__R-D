const { expect } = require("chai");

describe("Oracle Contract", function () {
  let oracle, owner, oracle1, oracle2, oracle3;

  beforeEach(async function () {
    [owner, oracle1, oracle2, oracle3] = await ethers.getSigners();
    oracle = await ethers.deployContract("Oracle");
    oracle.on("UpdatedRequest", (id, urlToQuery, attributeToFetch, agreedValue) => {
      console.log(`UpdatedRequest event:`);
      console.log(`  id: ${id}, \n  urlToQuery: ${urlToQuery}, \n  attributeToFetch: ${attributeToFetch}, \n  agreedValue: ${agreedValue}`);
    });
  });

  it("should trigger UpdatedRequest event when quorum is reached", async function () {
    await oracle.createRequest(
        "https://api.example.com",
        "exampleAttribute",
        [oracle1.address, oracle2.address, oracle3.address]
      );

    await oracle.connect(oracle1).updateRequest(0, "sharedValue");
    const tx = await oracle.connect(oracle2).updateRequest(0, "sharedValue");
    await expect(tx).to.emit(oracle, "UpdatedRequest");

    // wait 1 sec to allow time for event to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));
  });
});
