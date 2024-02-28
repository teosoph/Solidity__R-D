const { expect } = require("chai");

const circuitName = process.env.CIRCUIT_NAME;

const circuitBuildFolderPath = `zero_knowledge/build/${circuitName}`;
const proof = require(`../${circuitBuildFolderPath}/proof.json`);
const publicSignals = require(`../${circuitBuildFolderPath}/public.json`);

describe("Zero Knowledge verifier test", () => {
  it(`Should verify the proof for "${circuitName}"`, async () => {
    const verifier = await ethers.deployContract(`${circuitBuildFolderPath}/verifier.sol:Groth16Verifier`);
    const preparedProof = prepareProof(proof);

    const result = await verifier.verifyProof(
      preparedProof.pi_a,
      preparedProof.pi_b,
      preparedProof.pi_c,
      publicSignals
    );

    expect(result).to.equal(true);
  });
});

function prepareProof(proof) {
  const { pi_a, pi_b, pi_c } = proof;
  const [[p1, p2], [p3, p4]] = pi_b;

  return {
    pi_a: pi_a.slice(0, 2),
    pi_b: [
      [p2, p1],
      [p4, p3],
    ],
    pi_c: pi_c.slice(0, 2),
  };
}
