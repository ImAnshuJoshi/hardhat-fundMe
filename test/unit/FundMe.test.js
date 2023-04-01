const {assert,expect} = require("chai");
const {network , deployments , ethers,getNamedAccounts} = require("hardhat");
const {developmentChains} = require("../../helper-hardhat-config.js");

!developmentChains.includes(network.name)
    ?describe.skip
    :
    describe("FundMe", function(){
        let FundMe;
        let deployer;
        let mockV3Aggregator;
        const sendValue = ethers.utils.parseEther("1")
        beforeEach(async ()=>{
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            FundMe = await ethers.getContract("FundMe",deployer);
            mockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
        })
        
        describe("constructor" , async function(){
            
            it("Sets the aggregator address correctly", async ()=>{
                // await ethers.getSigners();
                const response = await FundMe.getPriceFeed();
                assert.equal(response, mockV3Aggregator.address);
            })
        })

        describe("Fund the contract", async ()=>{
            it("fails if not enought eth", async ()=>{
                await expect(FundMe.fund()).to.be.revertedWith(
                    "You need to fund more eth ...."
                )
            })

            // it("Updates the amount funded", async ()=>{
            //     await FundMe.fund({value:sendValue });
            //     const response = FundMe.getAddressToAmountFunded(deployer);

            //     assert.equal(response.toString(), sendValue.toString());
            // })

            it("Adds funder to the array", async()=>{
                await FundMe.fund({value:sendValue});
                const response = await FundMe.getFunder(0);

                assert.equal(response , deployer);
            })
        })

        describe("Withdraw", async ()=>{
            beforeEach(async () => {
                await FundMe.fund({ value: sendValue })
            });

            it("Withdraws ETH from a single funder", async ()=>{
                const startingBalance = await FundMe.provider.getBalance(FundMe.address);
                const startingDeployerBalance = await FundMe.provider.getBalance(deployer);

                const txRes = await FundMe.withdraw();
                const txReceipt = await txRes.wait(1);

                const {gasUsed , effectiveGasPrice} = txReceipt;

                const endingFundMebalance = await FundMe.provider.getBalance(FundMe.address);

                const endingDeployerBalance = await FundMe.provider.getBalance(deployer);

                const gasCost = gasUsed.mul(effectiveGasPrice);

                assert.equal(endingFundMebalance.toString(), "0");
                assert.equal(startingDeployerBalance.add(startingBalance).toString(), endingDeployerBalance.add(gasCost).toString());
            })

            it("Allows withdraw from multiple funders" , async ()=>{
                const funders = await ethers.getSigners();

                for(i=1;i<5;i++){
                    const fundMeConnectedContract = await FundMe.connect(
                        funders[i]
                    )
                    await fundMeConnectedContract.fund({value:sendValue});
                }

                const startingFundMebalance = await FundMe.provider.getBalance(FundMe.address);
                const startingDeployerBalance = await FundMe.provider.getBalance(deployer);
                const txRes = await FundMe.withdraw();
                const txReceipt = await txRes.wait(1);

                const {gasUsed , effectiveGasPrice} = txReceipt;

                const gasCost = gasUsed.mul(effectiveGasPrice);
                const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address);
                const endingDeployerBalance = await FundMe.provider.getBalance(deployer);

                assert.equal(endingFundMeBalance.toString() , "0");
                assert.equal(startingFundMebalance.add(startingDeployerBalance).toString() , endingDeployerBalance.add(gasCost).toString());
            })

            it("Only allows the owner to withdraw ", async () =>{
                const [_, funder2] = await ethers.getSigners();
                await expect(FundMe.connect(funder2).withdraw()).to.be.revertedWith("FundMe_NotOwner()");

            })
        })
    })

    module.exports = describe;