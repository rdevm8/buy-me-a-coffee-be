const { network, getNamedAccounts, deployments } = require("hardhat")
const { etherscan } = require("../hardhat.config")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async () => {
    const { deploy, log } = deployments
    const { blockConfirmations, chainId } = network.config
    const { deployer } = await getNamedAccounts()

    log("---------------------------------------")

    const minimumDonation = networkConfig[chainId]["minimumDonation"]

    const args = [minimumDonation]

    const buyMeACoffee = await deploy("BuyMeACoffee", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: blockConfirmations || 1,
    })

    if (!developmentChains.includes(network.name) && etherscan.apiKey) {
        log("Verifying contract...")
        await verify(buyMeACoffee.address, args)
    }

    log("---------------------------------------")
}

module.exports.tags = ["all", "buyMeACoffee"]
