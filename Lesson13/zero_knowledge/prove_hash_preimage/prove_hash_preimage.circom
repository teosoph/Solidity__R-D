pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template ProveHashPreimage() {
    signal input preimage;
    signal output hash;
    hash <== Poseidon(1)([preimage]);
}
component main = ProveHashPreimage();
