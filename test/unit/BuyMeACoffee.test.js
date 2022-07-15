const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip()
    : describe("Buy Me A Coffee Unit Tests", () => {
          let deployer, buyMeACoffee, minimumDonation, message, donatorCount, chainId

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              chainId = network.config.chainId

              await deployments.fixture(["all"])

              buyMeACoffee = await ethers.getContract("BuyMeACoffee", deployer)
              minimumDonation = networkConfig[chainId]["minimumDonation"]
              message = networkConfig[chainId]["sampleMessage"]
              donatorCount = networkConfig[chainId]["donatorCount"]
          })

          describe("constructor", () => {
              it("initializes constructor", async () => {
                  const c_minimumDonation = await buyMeACoffee.getMinimumDonation()
                  const c_donatorsCount = await buyMeACoffee.getDonatorsCount()

                  assert.equal(c_minimumDonation.toString(), minimumDonation)
                  assert.equal(c_donatorsCount.toString(), "0")
              })
          })

          describe("buys a coffee", () => {
              it("successfully buys a coffee once", async () => {
                  await buyMeACoffee.buyCoffee(message, { value: minimumDonation })

                  const c_balance = await buyMeACoffee.provider.getBalance(buyMeACoffee.address)
                  const c_address = await buyMeACoffee.getDonator(0)
                  const c_amountDonated = await buyMeACoffee.getAddressToAmountDonated(deployer)
                  const c_message = await buyMeACoffee.getAddressToMessage(deployer)
                  const c_donatorsCount = await buyMeACoffee.getDonatorsCount()
                  const c_addressExist = await buyMeACoffee.getAddressToExists(deployer)

                  assert.equal(c_balance.toString(), minimumDonation)
                  assert.equal(c_address, deployer)
                  assert.equal(c_amountDonated.toString(), minimumDonation)
                  assert.equal(c_message.toString().trim(), message)
                  assert.equal(c_donatorsCount.toString(), "1")
                  assert.equal(c_addressExist.toString(), "true")
              })
              it("successfully buys a coffee twice", async () => {
                  await buyMeACoffee.buyCoffee(message, { value: minimumDonation })
                  await buyMeACoffee.buyCoffee(message, { value: minimumDonation })

                  const c_balance = await buyMeACoffee.provider.getBalance(buyMeACoffee.address)
                  const c_address = await buyMeACoffee.getDonator(0)
                  const c_amountDonated = await buyMeACoffee.getAddressToAmountDonated(deployer)
                  const c_message = await buyMeACoffee.getAddressToMessage(deployer)
                  const c_donatorsCount = await buyMeACoffee.getDonatorsCount()

                  assert.equal(c_balance.toString(), minimumDonation.mul(2))
                  assert.equal(c_address, deployer)
                  assert.equal(c_amountDonated.toString(), minimumDonation.mul(2))
                  assert.equal(c_message.toString().trim(), message.concat("\n").concat(message))
                  assert.equal(c_donatorsCount.toString(), "1")
              })
              it("successfully emits event", async () => {
                  await expect(buyMeACoffee.buyCoffee(message, { value: minimumDonation }))
                      .to.emit(buyMeACoffee, "BuyCoffee")
                      .withArgs(deployer, minimumDonation, message)
              })
              it("fails if less than minimum donation", async () => {
                  await expect(
                      buyMeACoffee.buyCoffee(message, { value: ethers.utils.parseEther("0") })
                  ).to.be.revertedWith("BuyMeACoffee__DidNotSendEnough")
              })
          })

          describe("withdrawal", () => {
              let nonOwnerAccts

              beforeEach(async () => {
                  nonOwnerAccts = await ethers.getSigners()
                  for (let ctr = 1; ctr <= donatorCount; ctr++) {
                      const donator = nonOwnerAccts[ctr]
                      const donatorBuyMeACoffee = await buyMeACoffee.connect(donator)

                      await donatorBuyMeACoffee.buyCoffee(message, { value: minimumDonation })
                  }
              })

              it("fails when not owner", async () => {
                  const attackerAcct = nonOwnerAccts[1]
                  const attackerBuyMeACoffee = await buyMeACoffee.connect(attackerAcct)

                  await expect(attackerBuyMeACoffee.withdraw()).to.be.revertedWith(
                      "BuyMeACoffee__NotOwner"
                  )
              })
              it("successfully withdraws", async () => {
                  const c_prevBalance = await buyMeACoffee.provider.getBalance(buyMeACoffee.address)

                  const deployerPrevBalance = await buyMeACoffee.provider.getBalance(deployer)

                  const transactionResponse = await buyMeACoffee.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const c_currBalance = await buyMeACoffee.provider.getBalance(buyMeACoffee.address)
                  const deployerCurrBalance = await buyMeACoffee.provider.getBalance(deployer)

                  assert.equal(c_currBalance.toString(), "0")
                  assert.equal(
                      c_prevBalance.add(deployerPrevBalance).toString(),
                      deployerCurrBalance.add(gasCost).toString()
                  )
              })
              it("successfully emits event", async () => {
                  await expect(buyMeACoffee.withdraw()).to.emit(buyMeACoffee, "Withdraw")
              })
          })
      })
