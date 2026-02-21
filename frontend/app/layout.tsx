// import type { Metadata } from "next";
// import "./globals.css";

// export const metadata: Metadata = {
//   title: "FlagZilla",
//   description: "multiplayer flag running game",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000' }}>
//         {children}
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { AudioProvider } from "./hooks/useAudio";
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
          {children}
        </AudioProvider>
      </body>
    </html>
  );
}