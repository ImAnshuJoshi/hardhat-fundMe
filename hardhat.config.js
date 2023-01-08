require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();
require("@nomiclabs/hardhat-etherscan");
// require("./tasks/block-number");
require("hardhat-gas-reporter");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */

const goerli_rpc_url =
    process.env.GOERLI_RPC_URL || "https://eth-goerli/example";
const privatekey = process.env.PRIVATE_KEY || "0xkey";
const etherscan_api_key = process.env.ETHERSCAN_API_KEY || "key";
const coinmarketcap_api_key = process.env.COINMARKET_API_KEY || "key";

module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.0" }]
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: goerli_rpc_url,
            accounts: [privatekey],
            chainId: 5,
            blockConfirmation: 6
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337
        }
    },
    etherscan: {
        apiKey: etherscan_api_key
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD"
        // coinmarketcap: coinmarketcap_api_key
    },
    namedAccounts: {
        deployer: {
            default: 0
        },
        user: {
            default: 1
        }
    }
};
