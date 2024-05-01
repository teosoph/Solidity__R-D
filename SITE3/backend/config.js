import contractArtifact2 from "../../artifacts/contracts/DomainRegistry2.sol/DomainRegistryV2.json" assert { type: "json" };
import contractArtifact3 from "../../artifacts/contracts/DomainRegistry3.sol/DomainRegistryV3.json" assert { type: "json" };
import deployedAddresses from "../../ignition/deployments/chain-31337/deployed_addresses.json" assert { type: "json" };

import data from "./data.json" assert { type: "json" };

// const config = {
//     deployerAddress: data.deployerAddress,
//     contractAddress: data.contractAddress,
//     contractAbi: contractArtifact.abi,
// };

const config = {
    // deployerAddress: deployedAddresses["DeployV2Module#DomainRegistryV2"],
    deployerAddress: "0xa62795cc821edfd2d39d72e42e02714995131fd8",
    contractAddress: deployedAddresses["DeployV2Module#DomainRegistryV2"],
    contractAbi: contractArtifact2.abi,
};

export default config;
