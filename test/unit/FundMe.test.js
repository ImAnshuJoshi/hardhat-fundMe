const { assert, expect } = require("chai");
const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe;
          let deployer;
          let mockV3Aggregator;
          const sent_value = ethers.utils.parseEther("1");
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async function() {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });
              it("Updates the amount funded data structure!", async () => {
                  await fundMe.fund({ value: sent_value });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(response.toString(), sent_value.toString());
              });
              it("Adds funder to the array!", async () => {
                  await fundMe.fund({ value: sent_value });
                  const response = await fundMe.getFunder(0);
                  assert.equal(response, deployer);
              });
          });

          describe("withdraw", () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sent_value });
              });
              it("Only the funder can withdraw!", async () => {
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReciept = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReciept;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("Withdraw from multiple funders", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 1; i < 6; i++) {
                      await fundMe
                          .connect(accounts[i])
                          .fund({ value: sent_value });
                  }
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  const transactionResponse = await fundMe.withdraw();
                  const transactionReciept = await transactionResponse.wait(1);

                  const { gasUsed, effectiveGasPrice } = transactionReciept;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });
              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectContract = fundMe.connect(attacker);
                  await expect(
                      attackerConnectContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner");
              });
          });
      });
