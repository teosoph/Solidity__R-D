import { keccak256 } from "ethers";
import assert from "assert";

const signature = "transfer(address,uint256)";
// const signature = "set(uint256)";
// const signature = "value()";
const data = Uint8Array.from(Buffer.from(signature));
const selector = keccak256(data).substring(0, 10);
console.log(`Selector: ${selector}`);
assert (selector === "0xa9059cbb");
