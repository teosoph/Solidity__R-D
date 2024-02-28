import hre   from "hardhat";

describe("SpecialFunctions", function () {
  it("SpecialFunctions", async function () {
    const a = await hre.ethers.deployContract("ContractA");

    const b = await hre.ethers.deployContract("ContractB", [a.target], {
      value: hre.ethers.parseEther("10"),
    });

    await b.pay();

    const provider = hre.ethers.provider;
    console.log("ContractA balance:", ethers.formatEther(await provider.getBalance(a.target)));
    console.log("ContractB balance:", ethers.formatEther(await provider.getBalance(b.target)));
  });
});
