import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const body = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const code = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DoraDoraUrl — An Anywhere Door for your links",
  description:
    "A Doraemon-inspired link gadget lab: Snowflake IDs, Base62 codes, custom aliases, Time-Furoshiki expiry and click bells. Short links with gadget magic.",
  metadataBase: new URL("https://doradoraurl.example"),
  openGraph: {
    title: "DoraDoraUrl — An Anywhere Door for your links",
    description:
      "Snowflake IDs · Base62 · Custom aliases · TTL · Click bells. A friendly gadget lab for links worth sharing.",
    type: "website",
    images: [
      {
        url: "/og-preview.png",
        width: 1365,
        height: 768,
        alt: "DoraDoraUrl — Doraemon flying past the golden link bell",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DoraDoraUrl — An Anywhere Door for your links",
    description:
      "Snowflake IDs · Base62 · Custom aliases · TTL · Click bells. A friendly gadget lab for links worth sharing.",
    images: ["/og-preview.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", display.variable, body.variable, code.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col bg-sky text-ink font-body">
        {children}
      </body>
    </html>
  );
}
