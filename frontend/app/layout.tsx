import type { Metadata } from "next";
import { AudioProvider, MuteButton } from "./hooks/useAudio";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlagZilla",
  description: "Capture. Hold. Win.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AudioProvider>
          <MuteButton />
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}