import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { SidebarProvider } from "@/lib/sidebar";
import { SessionProvider } from "next-auth/react";

export const metadata: Metadata = {
  title: {
    default: "ScaffoldAI",
    template: "%s · ScaffoldAI",
  },
  description: "A personalized AI learning companion powered by everything you've learned.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash script: runs before React hydration to set the correct theme class.
            Forced-light pages (/, /login, /register) always get 'light'.
            All other pages read the stored preference from localStorage. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var FORCED_LIGHT = ['/', '/login', '/register'];
  var path = window.location.pathname;
  if (FORCED_LIGHT.indexOf(path) !== -1) {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  } else {
    var stored = localStorage.getItem('scaffold-theme');
    var resolved = 'light';
    if (stored === 'dark') { resolved = 'dark'; }
    else if (stored === 'system' || !stored) {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
  }
})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <SessionProvider refetchOnWindowFocus={false}>
          <ThemeProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

