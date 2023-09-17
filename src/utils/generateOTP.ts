export default function GenerateOTP({
  length = 6,
}: {
  length: number;
}): string {
  const digits = '0123456789';
  let OTP = '';

  let i = 0;

  while (i < length) {
    // OTP += digits[Math.floor(Math.random() * 10)];
    OTP += Math.floor(Math.random() * 10);
    i++;
  }

  return OTP;
}
