const {
    networdConfig,
    developmentChains,
    networkConfig
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify.js");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log, get } = deployments;
    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId;
    let ethusdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await get("MockV3Aggregator");
        ethusdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethusdPriceFeedAddress = networkConfig[chainId]["ethusdPriceFeed"];
    }
    const args = [ethusdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        waitConfimations: network.config.blockConfirmations || 1
    });
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN) {
        await verify(fundMe.address, args);
    }
    log("-------------------------------------------------------------");
};

module.exports.tags = ["all", "fundMe"];
