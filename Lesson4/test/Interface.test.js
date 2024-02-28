
describe("Interface", function () {
  it("Interface1", async () => {
    const counter = await ethers.deployContract("Counter");
    const counterAddress = await counter.getAddress();
    const myContract = await ethers.deployContract("MyContract");

    await myContract.incrementCounter(counterAddress);
    await myContract.incrementCounter(counterAddress);
    await myContract.incrementCounter(counterAddress);

    const result = await myContract.getCount(counterAddress);
    console.log(`\nresult: ${result}\n`);
  });
});
