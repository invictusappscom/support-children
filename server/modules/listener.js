const Web3 = require('web3')
const config = require('../config').web3
const supportChildrenContract = require('../../client/src/contracts/SupportChildren.json')
const deployedNetwork = supportChildrenContract.networks[config.networkId]
const mail = require('./mail')

const web3 = new Web3(
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

  const calcPerc = await filledPercentage(campaignId, donationAmount)

  mail.donationMade(campaignId, donationAmount, email, calcPerc.perc)

  if (calcPerc.notifyDonorsOnReachedPercentage) {
    const emails = await contract.methods.getDonorEmails(campaignId).call()
    mail.campaignReachedInterestedPercentage(campaignId, calcPerc.collectedAmount, emails, (await filledPercentage(campaignId)).perc)
  }
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

  mail.campaignFinished(campaignId, collectedAmount, emails, (await filledPercentage(campaignId)).perc)
})

async function filledPercentage (campaignId, donationAmount) {
  let notifyDonorsOnReachedPercentage = false
  const campaigns = await contract.methods.getCampaigns().call()
  const targetAmount = campaigns[campaignId].targetAmount
  const currentAmount = campaigns[campaignId].currentAmount

  console.log(campaigns[campaignId].name)
  console.log(targetAmount)
  console.log(currentAmount)

  let perc = 0
  try {
    perc = (currentAmount / targetAmount * 100).toFixed(2)
  } catch (e) {
    console.error(e)
  }
  console.log(perc)

  if (donationAmount) {
    let beforePercentage
    try {
      beforePercentage = ((currentAmount - donationAmount) / targetAmount * 100).toFixed(2)
    } catch (e) {
      console.error(e)
      return { perc, notifyDonorsOnReachedPercentage: false }
    }
    if (beforePercentage < 25 && perc >= 25 && perc < 50) {
      notifyDonorsOnReachedPercentage = true
    } else if (beforePercentage < 50 && perc >= 50 && perc <= 75) {
      notifyDonorsOnReachedPercentage = true
    } else if (beforePercentage < 75 && perc >= 75 && perc <= 75) {
      notifyDonorsOnReachedPercentage = true
    } else if (beforePercentage < 100 && perc >= 100) {
      notifyDonorsOnReachedPercentage = true
    }
  }
  return { perc, notifyDonorsOnReachedPercentage, collectedAmount: currentAmount }
}
