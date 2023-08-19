"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sib_api_v3_typescript_1 = __importDefault(require("sib-api-v3-typescript"));
const fs_1 = __importDefault(require("fs"));
const EmailSender = fs_1.default.readFileSync('../emailTemplates/EmailSender.html');
class SendiblueEmail {
    static apiInstance = new sib_api_v3_typescript_1.default.TransactionalEmailsApi();
    sendSmtpEmail = new sib_api_v3_typescript_1.default.SendSmtpEmail();
    hieu = 'hieu';
    constructor() {
        SendiblueEmail.apiInstance.setApiKey(sib_api_v3_typescript_1.default.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY);
    }
    async SendEmail(to, otp, title = 'Xác minh tài khoản của bạn', noteExp = 1) {
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
        return await SendiblueEmail.apiInstance.sendTransacEmail(this.sendSmtpEmail);
    }
}
exports.default = new SendiblueEmail();
//# sourceMappingURL=sendinblueEmail.js.map