// Shared admin emails used by booking, payment, and service pages.
export const ADMIN_EMAILS = [
  'catchprabhat@gmail.com',
  'little.mishra23@gmail.com',
  'kzplusmotors@gmail.com',
  'jixdriveblr@gmail.com',
  'zpluscarcare@gmail.com',
  'kvkumarsg@gmail.com',
  'bikashpatra.tcs@gmail.com',
  'pamazon502@gmail.com'
  'umrsjd455@gmail.com',
  'umrsjd562@gmail.com',
].map((email) => email.toLowerCase());

export function isAdminEmail(email?: string | null): boolean {
  return ADMIN_EMAILS.includes((email || '').toLowerCase());
}
