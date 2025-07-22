// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: "Channel Manager",
  description: "",
  icons: {
    icon: "/logo.png", 
  },

};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
         <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
