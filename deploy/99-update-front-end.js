const fs = require("fs")
const { ethers, network } = require("hardhat")
const { json } = require("hardhat/internal/core/params/argumentTypes")

const DO_FRONT_END_UPDATE = process.env.DO_FRONT_END_UPDATE
const FRONT_END_ADDRESSES_FILE = process.env.FRONT_END_ADDRESSES_FILE
const FRONT_END_ABI_FILE = process.env.FRONT_END_ABI_FILE

module.exports = async () => {
    if (DO_FRONT_END_UPDATE) {
        console.log("Updating frontend ABI references...")

        console.log(FRONT_END_ADDRESSES_FILE)

        await updateAbi()
        await updateContractAddresses()
    }
}

async function updateAbi() {
    const buyMeACoffee = await ethers.getContract("BuyMeACoffee")
    fs.writeFileSync(
        FRONT_END_ABI_FILE,
        buyMeACoffee.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const buyMeACoffee = await ethers.getContract("BuyMeACoffee")
    const chainId = network.config.chainId
    const currentAddresses = JSON.parse(fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8"))

    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(buyMeACoffee.address)) {
            currentAddresses[chainId].push(buyMeACoffee.address)
        }
    } else {
        currentAddresses[chainId] = [buyMeACoffee.address]
    }

    fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses))
}

module.exports.tags = ["all", "frontend"]
