set -a
source .env
set +a

NFT_ARGS=$(cast abi-encode "constructor(uint256,uint256,string)" \
  50 \
  3000000000000000 \
  "ipfs://$METADATA_CID/")

MINER_ARGS=$(cast abi-encode "constructor(address)" \
  $RESONANCE_GENESIS_ADDRESS)

echo "NFT_ARGS=$NFT_ARGS"
echo "MINER_ARGS=$MINER_ARGS"

forge verify-contract $RESONANCE_GENESIS_ADDRESS \
  src/ResonanceGenesis.sol:ResonanceGenesis \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $NFT_ARGS

forge verify-contract $CHLADNI_NODE_MINER_ADDRESS \
  src/ChladniNodeMiner.sol:ChladniNodeMiner \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $MINER_ARGS