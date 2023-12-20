const hre = require("hardhat");
const { addAddress, toWei, REEF_ADDRESS } = require("./utils");

async function main() {
  const reefswapDeployer = await hre.reef.getSignerByName("account");
  const signerAddress = await reefswapDeployer.getAddress();
  const skipVerification = process.env.SKIP_VERIFICATION == "true";

  console.log(`\n=====> Start deployment of ReefSwap on ${hre.network.name} with account ${reefswapDeployer._substrateAddress} <=====`);
  console.log(`Verify contracts: ${!skipVerification}`);

  // Reefswap contracts
  const ReefswapV2Factory = await hre.reef.getContractFactory(
    "ReefswapV2Factory",
    reefswapDeployer
  );
  const ReefswapV2Router = await hre.reef.getContractFactory(
    "ReefswapV2Router02",
    reefswapDeployer
  );

  // Deploy factory
  console.log("Deploying factory...");
  const factoryArgs = [signerAddress];
  const factory = await ReefswapV2Factory.deploy(...factoryArgs);
  console.log(`Factory deployed to ${factory.address}`);
  addAddress("ReefswapV2Factory", factory.address);
  if (!skipVerification) {
    console.log("Verifying factory...");
    await hre.reef.verifyContract(
      factory.address,
      "ReefswapV2Factory",
      factoryArgs,
      { compilerVersion: "v0.5.16+commit.9c3226ce" }
    );
  }

  // Deploy router
  console.log("Deploying router...");
  const routerArgs = [factory.address, REEF_ADDRESS];
  const router = await ReefswapV2Router.deploy(...routerArgs);
  console.log(`Router deployed to ${router.address}`);
  addAddress("ReefswapV2Router02", router.address);
  if (!skipVerification) {
    console.log("Verifying router...");
    await hre.reef.verifyContract(
      router.address,
      "ReefswapV2Router02",
      routerArgs,
      { compilerVersion: "v0.6.6+commit.6c089d02" }
    );
  }

  // Deploy tokens and create REEF pairs
  const tokenNames = ["Shark", "Dolphin", "Jellyfish", "Turtle", "FreeMint"];
  const amount1 = toWei("100");
  const amount2 = toWei("50");
  const reefToken = await hre.reef.getContractAt("Token", REEF_ADDRESS, reefswapDeployer);
  await reefToken.approve(router.address, amount1.mul(tokenNames.length));

  for (const tokenName of tokenNames) {
      // Create token
      console.log(`Deploying ${tokenName}...`);
      const Token = await hre.reef.getContractFactory(tokenName, reefswapDeployer);
      const tokenArgs = [toWei(1e9)];
      const token = await Token.deploy(...tokenArgs);
      console.log(`${tokenName} deployed to ${token.address}`);
      addAddress(tokenName, token.address);
      if (process.env.SKIP_VERIFICATION != "true") {
          console.log(`Verifying ${tokenName}...`);
          await hre.reef.verifyContract(token.address, tokenName, tokenArgs, {
              compilerVersion: "v0.7.3+commit.9bfce1f6",
          });
      }

      // Create pair
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
