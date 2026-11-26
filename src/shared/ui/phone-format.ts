/** A Thai mobile number has ten digits. */
export const PHONE_LENGTH = 10;

/** Groups digits the way Thai mobile numbers are read: 080-000-0000. Anything that is not a
 *  digit, and anything past ten digits, is dropped. */
export function formatPhoneDigits(digits: string): string {
  const clean = digits.replace(/\D/g, "").slice(0, PHONE_LENGTH);
  return [clean.slice(0, 3), clean.slice(3, 6), clean.slice(6)].filter(Boolean).join("-");
}

/** The value after one key press: a single digit is appended, anything else (and an
 *  eleventh digit) leaves the value as it is. */
export function nextPhoneValue(value: string, digit: string): string {
  if (!/^\d$/.test(digit) || value.length >= PHONE_LENGTH) return value;
  return value + digit;
}
