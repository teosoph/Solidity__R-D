(async () => {
  const myToken = await ethers.deployContract("MyToken");
  console.log("MyToken deployed to:", await myToken.getAddress());
})();
