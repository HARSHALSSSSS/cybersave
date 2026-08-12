/** Canonical Indian mobile format used for OTP request/verify (+91XXXXXXXXXX). */
export function normalizeCitizenPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  if (phone.trim().startsWith('+')) {
    return phone.replace(/\s+/g, '');
  }
  return digits || phone.replace(/\s+/g, '');
}

export function citizenPhoneVariants(phone: string): string[] {
  const normalized = normalizeCitizenPhone(phone);
  const digits = phone.replace(/\D/g, '');
  const last10 = digits.length >= 10 ? digits.slice(-10) : digits;
  const variants = new Set<string>([
    normalized,
    phone.replace(/\s+/g, ''),
  ]);
  if (last10.length === 10) {
    variants.add(last10);
    variants.add(`+91${last10}`);
    variants.add(`91${last10}`);
  }
  return [...variants];
}
