import CryptoJS from 'crypto-js';
import * as argon2 from 'argon2';

export function encryptPasswordOld(password: string) {
  const encryptedHex = CryptoJS.SHA512(password).toString();

  return encryptedHex;
}

export async function encryptPassword(password: string) {
  // const encryptedHex = CryptoJS.SHA512(password).toString();

  const encryptedHex = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    hashLength: 50,
    // secret: Buffer.from(process.env.APP_TOKEN_SECRET!),
  });

  return encryptedHex;
}
