import { MAIL_OPTS } from '../config/mail.config'
const nodemailer = require('nodemailer')

class MailHandler {
    transporter: any;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: MAIL_OPTS.user,
                pass: MAIL_OPTS.pass
            }
        })
    }

    private send(mailOptions: any): void {
        this.transporter.sendMail(mailOptions, function (error: any, info: { response: string; }) {
            if (error) {
                console.log(error)
            } else {
                console.log('Email sent: ' + info.response)
            }
        })
    }

    public donationMade(campaignId: any, donationAmount: any, email: any, filledPercentage: any) {
        const mailOptions = {
            from: MAIL_OPTS.user,
            to: email,
            subject: 'Donation is made for campaign that you created',
            text: `For campaign with id: ${campaignId} donation is made ${donationAmount} wei! Which is ${filledPercentage}%`
        }
        this.send(mailOptions)
    }

    public campaignFinished(campaignId: any, collectedAmount: any, emails: any, filledPercentage: number) {
        emails = this.cleanEmails(emails)

        let text = `Congratulations, campaign that you supported is finished. For campaign with id: ${campaignId} total collected amount is ${collectedAmount} wei! Which is ${filledPercentage}%`
        let subject = 'Campaign is finished!'
        // check if campaign is finished successfully or stopped
        if (filledPercentage < 100) {
            text = `Campaign with id: ${campaignId} is stopped. total collected amount is ${collectedAmount} wei! Which is ${filledPercentage}%`
            subject = 'Campaign is stopped!'
        }

        const mailOptions = {
            from: MAIL_OPTS.user,
            bcc: emails,
            subject,
            text
        }
        this.send(mailOptions)
    }

    public campaignReachedInterestedPercentage(campaignId: any, collectedAmount: any, emails: any, filledPercentage: any) {
        emails = this.cleanEmails(emails)

        const text = `For campaign with id: ${campaignId} total collected amount is ${collectedAmount} wei! Which is ${filledPercentage}%`
        const subject = `Campaign that you supported has reached ${filledPercentage}%`

        const mailOptions = {
            from: MAIL_OPTS.user,
            bcc: emails,
            subject,
            text
        }
        this.send(mailOptions)
    }

    private cleanEmails(emails: String[]) {
        // remove duplicates, if someone contributed more then once in capmaign
        emails = [...new Set(emails)]

        // remove empty emails, for people which wants to be anonym and did not provide email
        emails = emails.filter((email: any) => email)

        return emails
    }

}

export default MailHandler;