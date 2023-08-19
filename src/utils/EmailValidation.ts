import fetch from 'node-fetch';
// import dotenv from 'dotenv';
// dotenv.config();

export default function ValidateEmail(email: string): boolean {
  const emailValidateResponse: any = fetch(
    `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
  ).then((res) => res.json());

  //   const emailValidateResponse = fetch(
  //     `https://mailbite.io/api/check?key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
  //   ).then((res) => res.json());

  //   const emailValidateResponse = fetch(
  //     `https://api.zerobounce.net/v2/validate?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
  //   ).then((res) => res.json());

  //   const emailValidateResponse = fetch(
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
  } else {
    return false;
  }
}
