"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmail = void 0;
const sib_api_v3_typescript_1 = __importDefault(require("sib-api-v3-typescript"));
var apiInstance = new sib_api_v3_typescript_1.default.TransactionalEmailsApi();
// Configure API key authorization: api-key
apiInstance.setApiKey(sib_api_v3_typescript_1.default.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY);
let sendSmtpEmail = new sib_api_v3_typescript_1.default.SendSmtpEmail();
async function SendEmail(to, otp, title = 'Xác minh tài khoản của bạn', noteExp = 1) {
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
exports.SendEmail = SendEmail;
//# sourceMappingURL=sendinblueEmail.js.map