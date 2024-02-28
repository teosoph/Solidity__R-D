(async () => {
  const Contract = await ethers.getContractFactory("SimpleStorageV1");
  // const contract = await Contract.deploy();
  const contract = await upgrades.deployProxy(Contract);
  console.log("SimpleStorageV1 deployed to:", await contract.getAddress());
})();
