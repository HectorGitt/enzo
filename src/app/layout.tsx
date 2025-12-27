import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Enzo | The Live Resume",
  description: "End Career Amnesia. Autonomous professional syncing.",
  icons: {
    icon: "/enzo.png",
    apple: "/enzo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
