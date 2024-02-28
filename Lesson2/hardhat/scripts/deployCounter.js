async function main() {
  const counter = await hre.ethers.deployContract("Counter");
  await counter.waitForDeployment();

  // name conflict resolution
  const func = await counter.getFunction("waitForDeployment()");
  console.log(await func());
  const func2 = await counter.getFunction("waitForDeployment(uint256)");
  console.log(await func2(10));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
