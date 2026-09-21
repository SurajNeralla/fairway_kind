import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth/auth-context';

export const metadata: Metadata = {
  title: 'FairwayKind | Feel, Not Fairway — Modern Performance & Philanthropy',
  description: 'The modern performance platform where your golf rounds unlock monthly community rewards while directly funding causes you care about. A minimum 10% of every membership is donated to your chosen charity.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-background text-on-surface antialiased font-sans selection:bg-primary-fixed selection:text-primary min-h-screen flex flex-col">
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
