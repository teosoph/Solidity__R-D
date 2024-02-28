
if [ "$#" -ne 2 ]
then
    echo "Wrong inputs!!!">&2
    echo "Usage:   $0 CIRCUIT_PATH $1 INPUT_PATH">&2
    echo "Example: ./generate-withess-and-proof.sh example.circom" >&2
    exit 1
fi

CIRCUIT_NAME="$1"
WITNESS_GEN_FOLDER=./build/`basename "$CIRCUIT_NAME" .circom`/`basename "$CIRCUIT_NAME" .circom`_js
INPUT_PATH="$2"


cd "$WITNESS_GEN_FOLDER"
node generate_witness.js ../circuit.wasm ../../../"$INPUT_PATH" ../witness.wtns
cd ..
snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json
snarkjs groth16 verify verification_key.json public.json proof.json
