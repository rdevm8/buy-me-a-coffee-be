const { assert } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
    ? describe.skip()
    : describe("Buy Me A Coffee Staging Tests", () => {
          let deployer, buyMeACoffee, minimumDonation, message, chainId

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              chainId = network.config.chainId

              buyMeACoffee = await ethers.getContract("BuyMeACoffee", deployer)
              minimumDonation = networkConfig[chainId]["minimumDonation"]
              message = networkConfig[chainId]["sampleMessage"]
          })

          it("allows people to fund and withdraw", async function () {
              await buyMeACoffee.buyCoffee(message, { value: minimumDonation })
              await buyMeACoffee.withdraw()

              const endingBalance = await buyMeACoffee.provider.getBalance(buyMeACoffee.address)

              assert.equal(endingBalance.toString(), 0)
          })
      })
