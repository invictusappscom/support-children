const nodemailer = require('nodemailer')
const config = require('../config').mail

const transporter = nodemailer.createTransport({
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

function donationMade (campaignId, donationAmount, email, filledPercentage) {
  const mailOptions = {
    from: config.user,
    to: email,
    subject: 'Donation is made for campaign that you created',
    text: `For campaign with id: ${campaignId} donation is made ${donationAmount} wei! Which is ${filledPercentage}%`
  }
  send(mailOptions)
}

function campaignFinished (campaignId, collectedAmount, emails, filledPercentage) {
  emails = cleanEmails(emails)

  let text = `Congratulations, campaign that you supported is finished. For campaign with id: ${campaignId} total collected amount is ${collectedAmount} wei! Which is ${filledPercentage}%`
  let subject = 'Campaign is finished!'
  // check if campaign is finished successfully or stopped
  if (filledPercentage < 100) {
    text = `Campaign with id: ${campaignId} is stopped. total collected amount is ${collectedAmount} wei! Which is ${filledPercentage}%`
    subject = 'Campaign is stopped!'
  }

  const mailOptions = {
    from: config.user,
    bcc: emails,
    subject,
    text
  }
  send(mailOptions)
}

function campaignReachedInterestedPercentage (campaignId, collectedAmount, emails, filledPercentage) {
  emails = cleanEmails(emails)

  const text = `For campaign with id: ${campaignId} total collected amount is ${collectedAmount} wei! Which is ${filledPercentage}%`
  const subject = `Campaign that you supported has reached ${filledPercentage}%`

  const mailOptions = {
    from: config.user,
    bcc: emails,
    subject,
    text
  }
  send(mailOptions)
}

function cleanEmails (emails) {
  // remove duplicates, if someone contributed more then once in capmaign
  emails = [...new Set(emails)]

  // remove empty emails, for people which wants to be anonym and did not provide email
  emails = emails.filter((email) => email)

  return emails
}

exports.donationMade = donationMade
exports.campaignFinished = campaignFinished
exports.campaignReachedInterestedPercentage = campaignReachedInterestedPercentage
