import SibApiV3Sdk from 'sib-api-v3-typescript';
import fs from 'fs';
const EmailSender = fs.readFileSync('../emailTemplates/EmailSender.html');

class SendiblueEmail {
  private static apiInstance: SibApiV3Sdk.TransactionalEmailsApi =
    new SibApiV3Sdk.TransactionalEmailsApi();

  public sendSmtpEmail: SibApiV3Sdk.SendSmtpEmail =
    new SibApiV3Sdk.SendSmtpEmail();

  protected hieu = 'hieu';

  constructor() {
    SendiblueEmail.apiInstance.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      process.env.SENDINBLUE_API_KEY!
    );
  }

  async SendEmail(
    to: string,
    otp: string,
    title: string = 'Xác minh tài khoản của bạn',
    noteExp = 1
  ) {
    this.sendSmtpEmail = {
      subject: 'Mã xác thực email của bạn',
      sender: { name: 'Phimhay247', email: 'account@phimhay247.site' },
      to: [
        {
          email: to,
        },
      ],
      htmlContent: EmailSender.toString(),
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

    return await SendiblueEmail.apiInstance.sendTransacEmail(
      this.sendSmtpEmail
    );
  }
}

export default new SendiblueEmail();
