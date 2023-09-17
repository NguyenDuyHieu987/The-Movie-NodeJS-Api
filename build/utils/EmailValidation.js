"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
async function ValidateEmail(email) {
    const emailValidateResponse = await (0, node_fetch_1.default)(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`).then((res) => res.json());
    //   const emailValidateResponse = await fetch(
    //     `https://mailbite.io/api/check?key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
    //   ).then((res) => res.json());
    //   const emailValidateResponse = await fetch(
    //     `https://api.zerobounce.net/v2/validate?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
    //   ).then((res) => res.json());
    //   const emailValidateResponse = await fetch(
    //     `https://emailverification.whoisxmlapi.com/api/v2?apiKey=${process.env.EMAIL_VALIDATION_API_KEY}&emailAddress=${email}`
    //   );
    ////   Abstractapi
    const isValid = emailValidateResponse.is_smtp_valid.value == true;
    //// Mailbite
    // isValid = (
    //     emailValidateResponse.status == "ok"
    //     and emailValidateResponse.email_status == "VALID"
    // )
    ///// Zerobounce
    // isValid = emailValidateResponse.status == "valid"
    ///// WhoisXML
    // isValid = emailValidateResponse.smtpCheck == "true"
    if (isValid) {
        return true;
    }
    else {
        return false;
    }
}
exports.default = ValidateEmail;
//# sourceMappingURL=EmailValidation.js.map