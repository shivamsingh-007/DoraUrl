import { NextResponse } from "next/server";
import { countServerClick, getLinkRecord } from "@/lib/server-store";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    c === "&"
      ? "&amp;"
      : c === "<"
        ? "&lt;"
        : c === ">"
          ? "&gt;"
          : c === '"'
            ? "&quot;"
            : "&#39;",
  );
}

/**
 * GET /r/:code — server-side hop. Fully dynamic per-request lookup, so this
 * works in ANY browser/device with a true 307 (no prerender shell involved).
 * On a server miss the fallback HTML checks this browser's pocket first —
 * covering local-only mode and pre-server links — then shows miss/expired.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code: raw } = await ctx.params;
  let code = raw;
  try {
    code = decodeURIComponent(raw);
  } catch {
    /* keep raw */
  }

  const hit = await getLinkRecord(code);
  if (hit) {
    await countServerClick(code);
    return NextResponse.redirect(hit.url, 307);
  }

  const safeCode = esc(code);
  // JSON for JS embedding with `<` neutralized: a raw `</script>` in the code
  // would otherwise terminate the inline script block early (XSS). `\u003c`
  // decodes back to `<` at runtime, so behavior is unchanged.
  const jsCode = JSON.stringify(code).replace(/</g, "\\u003c");
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>No such gadget — DoraDoraUrl</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#e9f4fb;color:#0b2e44;font-family:system-ui,-apple-system,sans-serif;text-align:center;padding:24px}main{max-width:34rem}p.k{font-size:11px;font-weight:700;letter-spacing:.22em;text-transform:uppercase;opacity:.6;margin:0 0 12px}h1{font-size:1.8rem;margin:0 0 12px}p.b{font-size:.9rem;opacity:.7;line-height:1.6}a{display:inline-block;margin-top:20px;background:#0e9bd6;color:#fff;text-decoration:none;border-radius:999px;padding:12px 28px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}</style></head><body><main><p class="k" id="k">Checking the pocket…</p><h1 id="h">Looking for “${safeCode}”.</h1><p class="b" id="b">One moment.</p><a href="/">Back to the lab</a></main><script>(function(){var k=document.getElementById('k'),h=document.getElementById('h'),b=document.getElementById('b');function show(kind,title,body){k.textContent=kind;h.textContent=title;b.textContent=body;}try{var code=${jsCode};var raw=null;try{raw=localStorage.getItem('doradora_links_v2');}catch(e){}var links=raw?JSON.parse(raw):[];var hit=null;for(var i=0;i<links.length;i++){if(links[i]&&links[i].code===code){hit=links[i];break;}}if(hit&&hit.url&&(hit.expiresAt==null||Date.now()<=hit.expiresAt)){try{var n=parseInt(localStorage.getItem('doradora_clicks_v2')||'0',10);if(isNaN(n))n=0;localStorage.setItem('doradora_clicks_v2',String(n+1));}catch(e){}show('Opening the Anywhere Door','Hopping to your link…','Leaving now.');location.replace(hit.url);return;}if(hit){show('Furoshiki unwrapped','Link “'+code+'” has expired.','The Time Furoshiki has unwrapped this one. Mint a fresh link back home.');return;}}catch(e){}show('No such gadget','No gadget by the name “'+${jsCode}+'”.','It may live in another browser\\u2019s pocket — links minted before the server store only resolve where they were made.');})();</script></body></html>`;
  return new Response(html, {
    status: 404,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
