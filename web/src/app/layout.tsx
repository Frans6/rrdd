import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import UserContextProvider from "@/app/contexts/UserContext";
import EventContextProvider from "./contexts/EventContext";
import { NextUIProvider } from "@nextui-org/react";
// import ClientLayout from "./ClientLayout";
import { metadata, viewport } from "./metadata";

const outfit = Outfit({ subsets: ["latin"] });

// Exportamos os metadados do arquivo separado
export { metadata, viewport };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={outfit.className} suppressHydrationWarning={true}>
        <Toaster position="top-center" />
        <NextUIProvider>
          <UserContextProvider>
            <EventContextProvider>
              {/* <ClientLayout> */}
                {children}
              {/* </ClientLayout> */}
            </EventContextProvider>
          </UserContextProvider>
        </NextUIProvider>
      </body>
    </html>
  );
}
