const Web3 = require('web3')
const config = require('./config').web3
const supportChildrenContract = require('../client/src/contracts/SupportChildren.json')
const deployedNetwork = supportChildrenContract.networks[config.networkId]
const mail = require('./modules/mail')
const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, '../client/build')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'))
})

app.listen(9000)

let web3 = new Web3(
  new Web3.providers.WebsocketProvider(config.websocketProvider)
)

const contract = new web3.eth.Contract(supportChildrenContract.abi, deployedNetwork && deployedNetwork.address)

contract.events.DonationMade({}, (error, data) => {
  if (error) {
    return console.log('Error: ' + error)
  }

  const campaignId = data.returnValues[0]
  const donationAmount = data.returnValues[1]
  const email = data.returnValues[2]
  console.log('campaignId: ' + campaignId)
  console.log('donationAmount: ' + donationAmount)
  console.log('email: ' + email)

  mail.donationMade(campaignId, donationAmount, email)
})

contract.events.CampaignFinished({}, (error, data) => {
  if (error) {
    return console.log('Error: ' + error)
  }

  const campaignId = data.returnValues[0]
  const collectedAmount = data.returnValues[1]
  const emails = data.returnValues[2]
  console.log('campaignId: ' + campaignId)
  console.log('donationAmount: ' + collectedAmount)
  console.log('emails: ' + emails)

  mail.campaignFinished(campaignId, collectedAmount, emails)
})

async function test () {
  let campaigns = await contract.methods.getCampaigns().call()
  console.log(campaigns[0].name)
}

test()

console.log('Support Children service started...')
