import * as SibApiV3Sdk from '@sendinblue/client';
import fs from 'fs';
import path from 'path';
const EmailSender = fs
  .readFileSync(path.join(__dirname, '../emailTemplates/EmailSender.html'), {
    encoding: 'utf-8',
  })
  .toString();

console.log(__dirname);

class SendiblueEmail {
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

  async SendEmail({
    to,
    otp,
    title = 'Xác minh tài khoản của bạn',
    noteExp = 1,
  }: {
    to: string;
    otp: string;
    title: string;
    noteExp?: number;
  }) {
    this.sendSmtpEmail = {
      subject: 'Mã xác thực email của bạn',
      sender: { name: 'Phimhay247', email: 'account@phimhay247.site' },
      to: [
        {
          email: to,
        },
      ],
      htmlContent: EmailSender,
      params: {
        title: title,
        PIN: otp,
        noteExp: `Mã xác nhận của bạn sẽ hết hạn sau ${noteExp} phút.`,
      },
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
    };

    return await SendiblueEmail.apiInstance
      .sendTransacEmail(this.sendSmtpEmail)
      .then((res) => res)
      .catch((err) => {
        // console.log(err.body);
        throw err.response;
      });
  }
}

export default new SendiblueEmail();
