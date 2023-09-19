const hre = require("hardhat");
const ethers = require('ethers');

const REEF_ADDRESS = "0x0000000000000000000000000000000001000000";

const createToken = async (name, signer, amount) => {
  console.log('Deploying ' + name)
  const args = [amount];

  const Token = await hre.reef.getContractFactory(
    name,
    signer
  );

  const token = await Token.deploy(...args);
  console.log('Address: ', token.address)
  await hre.reef.verifyContract(token.address, name, args, {
    compilerVersion: "v0.7.3+commit.9bfce1f6",
  });

  return token;
}

const createFactory = async (signer) => {
  console.log("deploying factory");
  const factoryArgs = [await signer.getAddress()];
  const ReefswapV2Factory = await hre.reef.getContractFactory(
    "ReefswapV2Factory",
    signer
  );
  const factory = await ReefswapV2Factory.deploy(...factoryArgs);
  console.log("Verifing factory");
  await hre.reef.verifyContract(
    factory.address,
    "ReefswapV2Factory",
    factoryArgs,
    { compilerVersion: "v0.5.16+commit.9c3226ce" }
  );
  return factory;
}

const createRouter = async (signer, factoryAddress, mainTokenAddress) => {
  console.log("deploying router");
  const routerArgs = [factoryAddress, mainTokenAddress];
  const ReefswapV2Router = await hre.reef.getContractFactory(
    "ReefswapV2Router02",
    signer
  );
  const router = await ReefswapV2Router.deploy(...routerArgs);
  console.log("Verifing router");
  await hre.reef.verifyContract(
    router.address,
    "ReefswapV2Router02",
    routerArgs,
    { compilerVersion: "v0.6.6+commit.6c089d02" }
  );
  return router;
}

const addLiquidity = async (router, token1, token2, amount1, amount2, mainAddress) => {
  await token1.approve(router.address, amount1);
  await token2.approve(router.address, amount2);

  console.log("Approve add liquidity successful");

  const res = await router.addLiquidity(
    token1.address,
    token2.address,
    amount1,
    amount2,
    0,
    0,
    mainAddress,
    10000000000
  );

  console.log("Liquidity added");
  return res;
};

const removeLiquidity = async (token1, token2, factory, router, signer, amount) => {
  const poolAddr = await factory.getPair(token1.address, token2.address);
  const pool = await hre.reef.getContractAt("ReefswapV2Pair", poolAddr, signer);
  const evmAddress = await signer.getAddress();
  // console.log("Pool found")
  await pool.approve(router.address, amount)
  console.log("Approced remove successful")

  await router.removeLiquidity(
    token1.address,
    token2.address,
    amount,
    0,
    0,
    evmAddress,
    Date.now() + 60 * 1000,
  )
  console.log("Liquidity removed")
}

const swap = async (router, sell, buy, sellAmount, buyMinAmount, accEvmAddress) => {
  await sell.approve(router.address, sellAmount);
  console.log("Approve swap successful");

  await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
    sellAmount,
    buyMinAmount,
    [sell.address, buy.address],
    accEvmAddress,
    Date.now() + 60000 // One minute
  )
  console.log(`Swap success: ${sellAmount} -> ${buyMinAmount}`)
}

const fs = require('fs');

const addAddress = (name, address) => {
    if (!fs.existsSync('deployments.json')) {
        fs.writeFileSync('deployments.json', '{}');
    }
    const jsonData = fs.readFileSync('deployments.json', 'utf8');
    const data = JSON.parse(jsonData);
    data[name] = address;
    fs.writeFileSync('deployments.json', JSON.stringify(data, null, 2));
}

const getAddress = (name) => {
    const jsonData = fs.readFileSync('deployments.json', 'utf8');
    const data = JSON.parse(jsonData);
    return data[name];
}

const toWei = (amount) => {
    const wad = ethers.BigNumber.from("1000000000000000000");
    return wad.mul(amount);
}

module.exports = {
  swap,
  removeLiquidity,
  addLiquidity,
  createFactory,
  createRouter,
  createToken,
  REEF_ADDRESS,
  addAddress,
  getAddress,
  toWei
}