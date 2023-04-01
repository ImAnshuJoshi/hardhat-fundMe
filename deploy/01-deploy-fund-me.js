const { network } = require("hardhat")
const {developmentChains, networkConfig} = require("../helper-hardhat-config");
const {verify} = require('../utils/verify.js')
require("dotenv").config()

module.exports = async ({getNamedAccounts, deployments}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;

    if (networkConfig[chainId]) {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    } else {
        throw new Error(`No network configuration found for chainId ${chainId}`);
    }

    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    const FundMe = await deploy("FundMe",{
        from:deployer,
        args:[ethUsdPriceFeedAddress],
        log:true,
        waitConfirmations: network.config.waitConfirmations || 1
    })

    log(`The contract fundMe is deployed at ${FundMe.address}`);

    if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        await verify(FundMe.address, [ethUsdPriceFeedAddress]);
    }
}

module.exports.tags = ["all","fundme"];
