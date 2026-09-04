/**
 * Sanitizes phone numbers for WhatsApp API.
 * Automatically handles Brazilian phone numbers (adding DDI 55 if missing).
 */
export function sanitizePhoneNumber(rawPhone: string | number | undefined | null): string {
  if (!rawPhone) return '';
  
  // Convert to string and keep only digits
  const str = String(rawPhone).trim();
  let digits = str.replace(/\D/g, '');

  // Remove leading zeros
  digits = digits.replace(/^0+/, '');

  if (!digits) return '';

  // Standard Brazilian format handling:
  // If 10 digits (e.g. 1187654321) -> DDI missing, add 55
  // If 11 digits (e.g. 11987654321) -> DDI missing, add 55
  if (digits.length === 10 || digits.length === 11) {
    digits = '55' + digits;
  }

  return digits;
}

/**
 * Formats phone number for readable display.
 */
export function formatPhoneDisplay(cleanPhone: string): string {
  if (!cleanPhone) return 'Sem número';
  
  const digits = cleanPhone.replace(/\D/g, '');
  
  // Brazilian format with country code 55: 55 11 98888-8888
  if (digits.startsWith('55') && digits.length === 13) {
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 9);
    const part2 = digits.slice(9);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }
  
  if (digits.startsWith('55') && digits.length === 12) {
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 8);
    const part2 = digits.slice(8);
    return `+55 (${ddd}) ${part1}-${part2}`;
  }

  // Without 55: 11 98888-8888
  if (digits.length === 11) {
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 7);
    const part2 = digits.slice(7);
    return `(${ddd}) ${part1}-${part2}`;
  }

  if (digits.length === 10) {
    const ddd = digits.slice(0, 2);
    const part1 = digits.slice(2, 6);
    const part2 = digits.slice(6);
    return `(${ddd}) ${part1}-${part2}`;
  }

  return cleanPhone;
}

/**
 * Validates email format roughly
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Generates direct WhatsApp link
 */
export function generateWhatsAppLink(cleanPhone: string, message: string, useWebVersion = false): string {
  const encodedText = encodeURIComponent(message);
  if (useWebVersion) {
    return `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  }
  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
}

/**
 * Generates direct mailto link
 */
export function generateMailtoLink(email: string, subject: string, body: string): string {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email.trim()}?subject=${encodedSubject}&body=${encodedBody}`;
}
