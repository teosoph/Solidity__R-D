
describe('Inheritance', () => {
  it('Inheritance1', async () => {
    const c = await ethers.deployContract("F");
    const result = await c.foo();
    console.log(`\nresult: ${result}\n`);
  });

  it("Inheritance2", async () => {
    const c = await ethers.deployContract("Base2");
    const result = await c.foo();
    console.log(`\nresult: ${result}\n`);
  });

  it("Inheritance3", async () => {
    let c = await ethers.deployContract("Derived2", [3]);
    let result = await c.x();
    console.log(`\nresult: ${result}\n`);
    c = await ethers.deployContract("DerivedFromDerived");
    result = await c.x();
    console.log(`\nresult: ${result}\n`);
  });
});
