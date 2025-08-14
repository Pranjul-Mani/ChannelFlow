// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from '../lib/AuthContext';

export const metadata = {
  title: "ChannelFlow",
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
