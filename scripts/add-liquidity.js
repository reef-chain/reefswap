const hre = require("hardhat");
const { addAddress, toWei, REEF_ADDRESS, getAddress } = require("./utils");

async function main() {
  const reefswapDeployer = await hre.reef.getSignerByName("account");
  const signerAddress = await reefswapDeployer.getAddress();

  console.log(`\n=====> Start pools creation of ReefSwap on ${hre.network.name} with account ${reefswapDeployer._substrateAddress} <=====`);

  // Reefswap contracts
  const factoryAddress = await getAddress("ReefswapV2Factory");
  const factory = await hre.reef.getContractAt("ReefswapV2Factory", factoryAddress, reefswapDeployer);
  const routerAddress = await getAddress("ReefswapV2Router02");
  const router = await hre.reef.getContractAt("ReefswapV2Router02", routerAddress, reefswapDeployer);

  // Create REEF pairs
  const tokenNames = ["Shark", "Dolphin", "Jellyfish", "Turtle", "FreeMint"];
  const amount1 = toWei(100);
  const amount2 = toWei(50);
  const reefToken = await hre.reef.getContractAt("Token", REEF_ADDRESS, reefswapDeployer);
  await reefToken.approve(routerAddress, amount1.mul(tokenNames.length));

  for (const tokenName of tokenNames) {
      const tokenAddress = await getAddress(tokenName);
      const token = await hre.reef.getContractAt(tokenName, tokenAddress, reefswapDeployer);

      // Add liquidity and create pair if not exists
      await token.approve(router.address, amount2);
      await router.addLiquidity(
        REEF_ADDRESS,
        token.address,
        amount1,
        amount2,
        0,
        0,
        signerAddress,
        10000000000
      );

      // Check
      const tradingPairAddress = await factory.getPair(
        REEF_ADDRESS,
        token.address
      );
      const tradingPair = await hre.reef.getContractAt(
        "Token",
        tradingPairAddress,
        reefswapDeployer
      );
      const lpTokenAmount = await tradingPair.balanceOf(signerAddress);
      const reefAmount = await reefToken.balanceOf(tradingPairAddress);
      const ercAmount = await token.balanceOf(tradingPairAddress);
    
      console.log(`REEF-${tokenName} pair: ${tradingPair.address}`);
      addAddress(`pair_REEF-${tokenName}`, tradingPair.address);
      console.log({
        lpTokenAmount: lpTokenAmount.toString(),
        liquidityPoolReefAmount: reefAmount.toString(),
        liquidityPoolErcAmount: ercAmount.toString(),
      });
  };

  console.log("Finished!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
