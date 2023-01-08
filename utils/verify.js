// const { getContractAddress } = require("ethers/lib/utils");

const { run } = require("hardhat");

const verify = async (ContractAddress, args) => {
    console.log("Verifying contract......");
    try {
        await run("verify:verify", {
            address: ContractAddress,
            constructorArguments: args
        });
    } catch (e) {
        if (e.message.toLowerCase().include("already verifies")) {
            console.log("Already Verified!!!!!!");
        } else {
            console.log(err);
        }
    }
};

module.exports = verify;
