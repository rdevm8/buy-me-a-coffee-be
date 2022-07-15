const { ethers } = require("hardhat")
require("dotenv").config()

const developmentChains = ["hardhat", "localhost"]

const MINIMUM_DONATION = process.env.MINIMUM_DONATION
const SAMPLE_MESSAGE = process.env.SAMPLE_MESSAGE

const networkConfig = {
    4: {
        name: "rinkeby",
        minimumDonation: ethers.utils.parseEther(MINIMUM_DONATION),
        sampleMessage: SAMPLE_MESSAGE,
    },
    31337: {
        name: "hardhat",
        minimumDonation: ethers.utils.parseEther(MINIMUM_DONATION),
        sampleMessage: SAMPLE_MESSAGE,
        donatorCount: 5,
    },
}

module.exports = {
    networkConfig,
    developmentChains,
}
