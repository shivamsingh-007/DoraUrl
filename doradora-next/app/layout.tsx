import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import DoorRedirect from "@/components/DoorRedirect";

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
  // Must be the real public origin: social crawlers fetch og:image from this
  // absolute URL. The old placeholder (https://doradoraurl.example) made the
  // link preview image 404 on the deployed site. Override with
  // NEXT_PUBLIC_SITE_URL if a custom domain is attached later.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://dora-url.vercel.app"),
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
        {/* Pre-hydration fast path: if this is a #/r/<code> deep link, hop
            before React even boots so the homepage never flashes. Guarded,
            dependency-free, and mirrored by <DoorRedirect /> post-hydration
            (which also counts the bell ring + handles hashchange). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=(location.hash||'').match(/^#\\/r\\/(.+)$/);if(!m)return;var code='';try{code=decodeURIComponent(m[1]);}catch(e){return;}var raw=null;try{raw=localStorage.getItem('doradora_links_v2');}catch(e){return;}if(!raw)return;var links=null;try{links=JSON.parse(raw);}catch(e){return;}if(!Array.isArray(links))return;var hit=null;for(var i=0;i<links.length;i++){if(links[i]&&links[i].code===code){hit=links[i];break;}}if(!hit||!hit.url)return;if(hit.expiresAt!=null&&Date.now()>hit.expiresAt)return;try{var n=parseInt(localStorage.getItem('doradora_clicks_v2')||'0',10);if(isNaN(n))n=0;localStorage.setItem('doradora_clicks_v2',String(n+1));}catch(e){}location.replace(hit.url);}catch(e){}})();`,
          }}
        />
        <DoorRedirect />
        {children}
      </body>
    </html>
  );
}
