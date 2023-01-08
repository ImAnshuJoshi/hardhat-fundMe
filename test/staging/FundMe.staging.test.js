const { assert } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const {
    isCallTrace
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe;
          let deployer;
          const sendValue = ethers.utils.parseEther("2");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue });
              await fundMe.withdraw();
              const endingBalance = await fundMe.provider.getBalance(deployer);
              assert.equal(endingBalance.toString(), "0");
          });
      });
