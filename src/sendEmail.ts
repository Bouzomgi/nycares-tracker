import env from './config'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const sesClient = new SESClient({ region: env.REGION })

const createSendEmailCommand = (subject: string, message: string) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [env.TO_EMAIL],
    },
    Message: {
      Body: {
        Text: {
          Charset: 'UTF-8',
          Data: message,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: env.SOURCE_EMAIL,
    ReplyToAddresses: [],
  })
}

const sendEmail = (subject: string, message: string) => {
  const sendEmailCommand = createSendEmailCommand(subject, message)
  return sesClient.send(sendEmailCommand)
}

export default sendEmail
