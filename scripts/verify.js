const hre = require("hardhat");
const { toWei, getAddress, REEF_ADDRESS } = require("./utils");

async function main() {
  const reefswapDeployer = await hre.reef.getSignerByName("account");
  const signerAddress = await reefswapDeployer.getAddress();

  console.log(`\n=====> Start verification of ReefSwap on ${hre.network.name} <=====`);

  // Verify factory
  const factoryAddress = await getAddress("ReefswapV2Factory");
  const factoryArgs = [signerAddress];
  console.log("Verifying factory...");
  await hre.reef.verifyContract(
    factoryAddress,
    "ReefswapV2Factory",
    factoryArgs,
    { compilerVersion: "v0.5.16+commit.9c3226ce" }
  );

  // Verify router
  const routerAddress = await getAddress("ReefswapV2Router02");
  const routerArgs = [factoryAddress, REEF_ADDRESS];
  console.log("Verifying router...");
  await hre.reef.verifyContract(
    routerAddress,
    "ReefswapV2Router02",
    routerArgs,
    { compilerVersion: "v0.6.6+commit.6c089d02" }
  );

  // Verify tokens
  const tokenNames = ["Shark", "Dolphin", "Jellyfish", "Turtle", "FreeMint"];
  const tokenArgs = [toWei(1e9)];
  for (const tokenName of tokenNames) {
    console.log(`Verifying ${tokenName}...`);
    const tokenAddress = await getAddress(tokenName);
    await hre.reef.verifyContract(
      tokenAddress,
      tokenName,
      tokenArgs,
      { compilerVersion: "v0.7.3+commit.9bfce1f6" }
    );
  };

  console.log("Finished!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
