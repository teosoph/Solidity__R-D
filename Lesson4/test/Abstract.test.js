describe('Abstract', function () {
  it("Abstract1", async () => {
    const c = await ethers.deployContract("Cat");
    const result = await c.utterance();
    console.log(`\nresult: ${result}\n`);
  });
});
