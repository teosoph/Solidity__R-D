import { expect } from "chai";

describe("ClientReceipt", function () {
  it("should emit a Deposit event with correct data", async function () {
    const clientReceipt = await ethers.deployContract("ClientReceipt");
    clientReceipt.on("Deposit", (from, id, value) => {
      console.log("from: ", from);
      console.log("id: ", id);
      console.log("value: ", value);
    });

    const testId = ethers.encodeBytes32String("test_id");
    const testId2 = ethers.encodeBytes32String("test_id_2");
    const value = ethers.parseEther("2.0");
    await clientReceipt.deposit(testId, { value: value });
    await clientReceipt.deposit(testId2, { value: value * 2n });
    await clientReceipt.deposit(testId2, { value: value * 3n });
    await clientReceipt.deposit(testId2, { value: value * 4n });

    const filter = clientReceipt.filters.Deposit(null, testId2);
    const logs = await clientReceipt.queryFilter(filter, 4, "latest");
    logs.map((log) => {
      console.log("log.args: ", log.args);
    });
    expect(logs.length).to.equal(2);
  });
});
