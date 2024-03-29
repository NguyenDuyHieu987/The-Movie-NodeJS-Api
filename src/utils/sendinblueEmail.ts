import * as SibApiV3Sdk from '@sendinblue/client';
// import fs from 'fs';
// import path from 'path';
// const EmailSender = fs
//   .readFile(
//     path.join(
//       __dirname
//         .replace('utils', '')
//         .replace('src', process.env.NODE_ENV == 'production' ? '' : 'src'),
//       '/emailTemplates/VerificationOTP.html'
//     ),
//     {
//       encoding: 'utf-8',
//     }
//   )
//   .toString();
// import EmailSender from '@/emailTemplates/VerificationOTP';

export class SendiblueEmail {
  private static apiInstance: SibApiV3Sdk.TransactionalEmailsApi =
    new SibApiV3Sdk.TransactionalEmailsApi();

  private sendSmtpEmail: SibApiV3Sdk.SendSmtpEmail =
    new SibApiV3Sdk.SendSmtpEmail();

  constructor() {
    SendiblueEmail.apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.SENDINBLUE_API_KEY!
    );
  }

  async VerificationOTP({
    to,
    otp,
    title = 'Xác minh tài khoản của bạn',
    noteExp = 1
  }: {
    to: string;
    otp: string;
    title?: string;
    noteExp?: number;
  }) {
    this.sendSmtpEmail = {
      subject: 'Mã xác thực email của bạn',
      sender: { name: 'Phimhay247', email: 'account@phimhay247z.org' },
      to: [
        {
          email: to
        }
      ],
      // htmlContent: EmailSender,
      templateId: 4,
      params: {
        title,
        PIN: otp,
        noteExp: `Mã xác nhận của bạn sẽ hết hạn sau ${noteExp} phút.`
      },
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      }
    };

    return await SendiblueEmail.apiInstance
      .sendTransacEmail(this.sendSmtpEmail)
      .then((res) => res)
      .catch((err) => {
        // console.log(err.body);
        throw err.response;
      });
  }

  async VerificationLink({
    to,
    title,
    subject,
    nameLink,
    linkVerify,
    note1,
    noteExp = 10
  }: {
    to: string;
    title: string;
    subject: string;
    nameLink: string;
    linkVerify: string;
    note1: string;
    noteExp?: number;
  }) {
    this.sendSmtpEmail = {
      subject,
      sender: { name: 'Phimhay247', email: 'account@phimhay247z.org' },
      to: [
        {
          email: to
        }
      ],
      templateId: 5,
      params: {
        title,
        nameLink,
        linkVerify,
        note1,
        noteExp: `Yêu cầu này của bạn sẽ hết hiệu lực sau ${noteExp} phút.`
      },
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      }
    };

    return await SendiblueEmail.apiInstance
      .sendTransacEmail(this.sendSmtpEmail)
      .then((res) => res)
      .catch((err) => {
        throw err.response;
      });
  }
}

export default new SendiblueEmail();
