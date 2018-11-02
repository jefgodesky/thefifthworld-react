import Mailgun from 'mailgun-js'
import config from '../../config'

/**
 * This method sends an email through Mailgun.
 * @param msg {Object} - An object that should include three properties: `to`
 *   (a string that contains the email address to send the email to), `subject`
 *   (a string containing the subject line of the email) and `body` (a string
 *   containing the body of the email message).
 * @returns {Promise} - A promise that resolves when the email has been sent
 *   to Mailgun for delivery.
 */

const sendEmail = msg => {
  return new Promise((resolve, reject) => {
    if (msg.to && msg.subject && msg.body) {
      const mailgun = new Mailgun({ apiKey: config.mailgun.key, domain: config.mailgun.domain })
      const data = {
        from: config.mailgun.from,
        to: msg.to,
        subject: msg.subject,
        text: msg.body
      }
      mailgun.messages().send(data, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    } else {
      reject(new Error('Message did not include a recipient, subject, and/or body'))
    }
  })
}

export default sendEmail
