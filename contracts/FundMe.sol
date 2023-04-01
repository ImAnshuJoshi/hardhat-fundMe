// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe_NotOwner();

contract FundMe {

    using PriceConverter for uint256;


    AggregatorV3Interface private s_priceFeed;
    address private immutable i_owner;
    mapping(address=>uint256) private s_addressToAmount;
    address[] private s_funders;
    uint256 public constant MINIMUM_USD = 50* 10 ** 18;

    modifier onlyOwner{
        if(msg.sender != i_owner) 
        revert FundMe_NotOwner();
        _;
    }

    constructor(address priceFeed){
        s_priceFeed = AggregatorV3Interface(priceFeed);
        i_owner = msg.sender;
    }   

    function fund() public payable{
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to fund more eth ...."
        );
        s_addressToAmount[msg.sender]+=msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner{
        payable(msg.sender).transfer(address(this).balance);
        for(uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++){
            address funder = s_funders[funderIndex];
            s_addressToAmount[funder] = 0;
        }
        s_funders = new address[](0);
    }

    function getAddressToAmountFunded(address fundingAddress) public view returns (uint256){
        return s_addressToAmount[fundingAddress];
    }

    function getVersion() public view returns(uint256){
        return s_priceFeed.version();
    }

    function getFunder(uint256 index) public view returns(address){
        return s_funders[index];
    }

    function getOwner() public view returns(address){
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface){
        return s_priceFeed;
    } 
}