import SibApiV3Sdk from 'sib-api-v3-typescript';

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Configure API key authorization: api-key

apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.SENDINBLUE_API_KEY!
);

let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

export async function SendEmail(
  to: string,
  otp: string,
  title: string = 'Xác minh tài khoản của bạn',
  noteExp = 1
) {
  sendSmtpEmail = {
    subject: 'Mã xác thực email của bạn',
    sender: { name: 'Phimhay247', email: 'account@phimhay247.site' },
    to: [
      {
        email: to,
      },
    ],
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
  };

  return await apiInstance.sendTransacEmail(sendSmtpEmail);
}
