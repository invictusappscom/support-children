const nodemailer = require('nodemailer')
const config = require('../config').mail

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.user,
    pass: config.pass
  }
})

function send (mailOptions) {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}

function donationMade (campaignId, donationAmount, email) {
  const mailOptions = {
    from: config.user,
    to: email,
    subject: 'Donation is made for campaign that you created',
    text: `For campaign with id: ${campaignId} donation is made ${donationAmount} wei!`
  }
  send(mailOptions)
}

function campaignFinished (campaignId, collectedAmount, emails) {
  const mailOptions = {
    from: config.user,
    bcc: emails,
    subject: 'Donation is made for campaign that you created',
    text: `Congratulations, campaign that you supported is finished. For campaign with id: ${campaignId} total collected amount is ${collectedAmount} wei!`
  }
  send(mailOptions)
}

exports.donationMade = donationMade
exports.campaignFinished = campaignFinished
