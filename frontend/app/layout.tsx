import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/auth-provider';

export const metadata: Metadata = {
  title: 'AI Workflow SaaS',
  description: 'Multi-tenant workflow automation platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

