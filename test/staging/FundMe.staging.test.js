const { developmentChains } = require("../../helper-hardhat-config");
const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")


developmentChains.includes(network.name)
    ?describe.skip
    : describe("FundMe staging tests", function(){
        let deployer;
        let FundMe;
        const sendValue = ethers.utils.parseEther("1");

        beforeEach(async ()=>{
            deployer = (await getNamedAccounts()).deployer;
            FundMe = await ethers.getContract("FundMe", deployer);
        })

        it("Allows people to fund and withdraw", async function(){
            const fundTxResponse = await FundMe.fund({value:sendValue});
            await fundTxResponse.wait(1);

            const withdrawTxResponse = await FundMe.withdraw();
            await withdrawTxResponse.wait(1);

            const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address);
            assert.equal(endingFundMeBalance.toString(),"0");
        })
    })