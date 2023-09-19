# Reefswap

Reefswap is a DEX on the Reef chain.


## Existing deployment
Reefswap is already deployed on the following networks:


#### Reef Mainnet
```
factory: "0x380a9033500154872813F6E1120a81ed6c0760a8"
router: "0x641e34931C03751BFED14C4087bA395303bEd1A5"
```


#### Reef Testnet (Scuba):

```
factory: "0x8Fc2f9577f6c58e6A91C4A80B45C03d1e71c031f"
router: "0xd855a7c33ebF6566e846B0D6F7Ba7f7e1fe99768"
```

## Installing

Install all dependencies with `yarn`.

Reefswap can be deployed in different ways:

- `scripts/` folder includes `hardhat` scripts
- `src/` folder includes raw TypeScript scripts, which directly use `evm-provider.js`

## Setup accounts

Copy `.env.example` to `.env` (`cp .env.example .env`) and update the desired mnemonic variable to your account seed mnemonic for the corresponding network.

You can have multiple accounts by listing them in dictionary with your custom name:

```
seeds: {
	account1: "<MNEMONIC_SEED1>",
	account2: "<MNEMONIC_SEED2>",
	...
},
```

In JS script you can select the account with:
```
const reef = await hre.reef.getSignerByName("account");
```

in `scripts/deploy.js`, where `account` is the key of the item in the `seeds` dictionary.


If you get the following error:
```
Invalid Transaction: Inability to pay some fees , e.g. account balance too low
```

it is most likely because the accounts defined in the `hardhat.config.js` and JS script do not match.

### Network selection
Define your Reef chain URL in `hardhat.config.js` (by default `ws://127.0.0.1:9944`). If you want to run the script on the other network, you can do so in CLI with `--network {network-name}` flag.

Example:
`yarn hardhat run scripts/sample-script.js --network reef_testnet`

You can define the network configuration in `hardhat.config.js`. To change the default network, change the `defaultNetwork` variable.

If the networks URL exists (can be pinged), the system will automatically connect to it, else it will run internal `reef-node` and try to connect to it.


## Deploy

Run
`npx hardhat run scripts/deploy.js`

The script will create two ERC20 tokens, Reefswap Factory, Reefswap Router and add liquidity to them through the Reefswap router.


## Trade

Change the addresses in `src/trade.ts` to match the ones in the deploy scripts and then run:
`yarn trade`

## Random testing trading bot
Random bot was defined for the purpose of testing swap and pool data.
It consists of deployment and swapping

How to run:
- In the first instance user needs to provide 10k Reef to default accounts
- `yarn hardhat run scripts/botInit.js` - Create tokens, factory, router, verify them, add liquidity and remove liquidity
- Replace token addresses in `scripts/bot.js` with given output from `botInit` - Default accounts are swapping randomly with random amounts
- `yarn hardhat run scripts/bot.js`
