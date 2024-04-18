import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

export default async function ValidateEmail(email: string): Promise<boolean> {
  const emailValidateResponse: any = await fetch(
    `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
  ).then((res) => res.json());

  // const emailValidateResponse = await fetch(
  //   `https://mailbite.io/api/check?key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
  // ).then((res) => res.json());

  // const emailValidateResponse = await fetch(
  //   `https://api.zerobounce.net/v2/validate?api_key=${process.env.EMAIL_VALIDATION_API_KEY}&email=${email}`
  // ).then((res) => res.json());

  // const emailValidateResponse = await fetch(
  //   `https://emailverification.whoisxmlapi.com/api/v2?apiKey=${process.env.EMAIL_VALIDATION_API_KEY}&emailAddress=${email}`
  // );

  /// /   Abstractapi
  const isValid = emailValidateResponse.is_smtp_valid?.value == true;
  console.log(emailValidateResponse);

  /// / Mailbite
  // const isValid =
  //   emailValidateResponse?.status == 'ok' &&
  //   emailValidateResponse?.email_status == 'VALID';

  /// // Zerobounce
  // const isValid = emailValidateResponse?.status == 'valid';

  /// // WhoisXML
  // const isValid = emailValidateResponse?.smtpCheck == 'true';

  if (isValid) {
    return true;
  } else {
    return false;
  }
}
