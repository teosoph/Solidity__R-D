import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

describe("EIP712_Example", function () {
  async function deployFixture() {

    const [owner, otherAccount] = await ethers.getSigners();
    const EIP712_Example = await ethers.getContractFactory("EIP712_Example");

    // Create an EIP712 domainSeparator
    // https://eips.ethereum.org/EIPS/eip-712#definition-of-domainseparator
    const domainName = "TicketGenerator"  // the user readable name of signing domain, i.e. the name of the DApp or the protocol.
    const signatureVersion = "1" // the current major version of the signing domain. Signatures from different versions are not compatible.
    const chainId = network.config.chainId // the EIP-155 chain id. The user-agent should refuse signing if it does not match the currently active chain.

    // The typeHash is designed to turn into a compile time constant in Solidity. For example:
    // bytes32 constant MAIL_TYPEHASH = keccak256("Mail(address from,address to,string contents)");
    // https://eips.ethereum.org/EIPS/eip-712#rationale-for-typehash
    const typeHash = "Ticket(string eventName,uint256 price)"
    const argumentTypeHash = ethers.keccak256(ethers.toUtf8Bytes(typeHash)); // convert to byteslike, then hash it

    // https://eips.ethereum.org/EIPS/eip-712#specification-of-the-eth_signtypeddata-json-rpc
    const types = {
      Ticket: [
        { name: "eventName", type: "string" },
        { name: "price", type: "uint256" },
      ]
    }

    const contract = await EIP712_Example.deploy(domainName,signatureVersion,argumentTypeHash);

    const verifyingContract = await contract.getAddress() // the address of the contract that will verify the signature. The user-agent may do contract specific phishing prevention.

    const domain = {
      name: domainName,
      version: signatureVersion,
      chainId: chainId,
      verifyingContract: verifyingContract
    }

    return { contract, owner, otherAccount, domain,types };
  }

  describe("Signing data", function () {

    it("Should verify that a ticket has been signed by the proper address", async function () {
      const { contract,domain,types, owner  } = await loadFixture(deployFixture);
      const ticket = {
        eventName:"EthDenver",
        price: ethers.parseEther("0.1")
      }

      const signature = await owner.signTypedData(domain, types, ticket)

      const signerAddr = await contract.getSigner(ticket.eventName, ticket.price, signature);
      expect(signerAddr).to.equal(await owner.getAddress());
    });

  });
});
