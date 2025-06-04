// List of admin user emails
export const ADMIN_EMAILS = [
  'admin@example.com',
  'sohan@gmail.com',
  'sohank.design@yahoo.com',
  // Add more admin emails as needed
];

// Helper function to check if an email belongs to an admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email);
} 