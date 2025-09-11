import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Medialternatives',
  description: 'Secure login access to Medialternatives admin features',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page-container" data-auth-page="true">
      {children}
    </div>
  );
}