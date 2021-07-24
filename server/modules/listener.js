const Web3 = require('web3')
const config = require('../config').web3
const supportChildrenContract = require('../../client/src/contracts/SupportChildren.json')
const deployedNetwork = supportChildrenContract.networks[config.networkId]
const mail = require('./mail')

let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.websocketProvider)
)

const contract = new web3.eth.Contract(supportChildrenContract.abi, deployedNetwork && deployedNetwork.address)

contract.events.DonationMade({}, async (error, data) => {
  if (error) {
    return console.log('Error: ' + error)
  }

  const campaignId = data.returnValues[0]
  const donationAmount = data.returnValues[1]
  const email = data.returnValues[2]
  console.log('campaignId: ' + campaignId)
  console.log('donationAmount: ' + donationAmount)
  console.log('email: ' + email)

  mail.donationMade(campaignId, donationAmount, email, await filledPercentage(campaignId))
})

contract.events.CampaignFinished({}, async (error, data) => {
  if (error) {
    return console.log('Error: ' + error)
  }

  const campaignId = data.returnValues[0]
  const collectedAmount = data.returnValues[1]
  const emails = data.returnValues[2]
  console.log('campaignId: ' + campaignId)
  console.log('donationAmount: ' + collectedAmount)
  console.log('emails: ' + emails)

  mail.campaignFinished(campaignId, collectedAmount, emails, await filledPercentage(campaignId))
})

async function filledPercentage (campaignId) {
  let campaigns = await contract.methods.getCampaigns().call()
  console.log(campaigns[campaignId].name)
  console.log(campaigns[campaignId].targetAmount)
  console.log(campaigns[campaignId].currentAmount)

  let perc = 0
  try {
    perc = (campaigns[campaignId].currentAmount / campaigns[campaignId].targetAmount * 100).toFixed(2)
  } catch (e) {
    console.error(e)
  }
  console.log(perc)
  return perc
}
