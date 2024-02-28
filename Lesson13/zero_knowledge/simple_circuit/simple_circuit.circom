pragma circom 2.0.0;

template SimpleCircuit() {
    signal input a;
    signal input b;
    signal output c;
    a * b ==> c;
}
component main = SimpleCircuit();
//component main{public [a]} = SimpleCircuit();
