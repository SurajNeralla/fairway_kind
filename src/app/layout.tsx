import type { Metadata } from 'next';
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from '@/lib/auth/auth-context';
import { PageTransition } from '@/components/layout/PageTransition';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-outfit',
  display: 'swap',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

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
    <html lang="en" className={`scroll-smooth ${outfit.variable} ${plusJakartaSans.variable}`}>
      <body className="bg-background text-on-surface antialiased font-sans selection:bg-primary-fixed selection:text-primary min-h-screen flex flex-col">
        <ToastProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1 flex flex-col">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
