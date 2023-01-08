// This file is to define which network to use in a chainID whatever it is . Like we defined constructor argument in fundMe to define the argument when we deploy the fundMe contract , it is  being used

const networkConfig = {
    5: {
        name: "goerli",
        ethusdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e"
    },
    137: {
        name: "polygon",
        ethusdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    }
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER
};
