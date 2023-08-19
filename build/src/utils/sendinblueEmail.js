"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const SibApiV3Sdk = __importStar(require("@sendinblue/client"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const EmailSender = fs_1.default
    .readFileSync(path_1.default.join(__dirname
    .replace('utils', '')
    .replace('src', process.env.NODE_ENV == 'production' ? '' : 'src'), '/emailTemplates/EmailSender.html'), {
    encoding: 'utf-8',
})
    .toString();
class SendiblueEmail {
    static apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    constructor() {
        SendiblueEmail.apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.SENDINBLUE_API_KEY);
    }
    async SendEmail({ to, otp, title = 'Xác minh tài khoản của bạn', noteExp = 1, }) {
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
exports.default = new SendiblueEmail();
//# sourceMappingURL=sendinblueEmail.js.map