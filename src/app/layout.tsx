import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppThemeProvider from "./components/AppThemeProvider";
import FirebaseMessagingProvider from "./components/FirebaseMessagingProvider";
import AppLayout from "./components/AppLayout";
import { LanguageProvider } from "./components/LanguageProvider"; // Import the new provider
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dealdee Marketplace",
  description: "Your one-stop shop for everything!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppThemeProvider>
          <LanguageProvider> {/* Wrap with the new provider */}
            {/* <FirebaseMessagingProvider> */}
              <AppLayout>
                {children}
              </AppLayout>
            {/* </FirebaseMessagingProvider> */}
            <ToastContainer />
          </LanguageProvider>
        </AppThemeProvider>
      </body>
    </html>
  );
}
