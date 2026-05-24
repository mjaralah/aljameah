// يحل روابط Google Maps المختصرة (maps.app.goo.gl, goo.gl/maps) ويستخرج رابط تضمين قابل للعرض
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function followRedirects(url: string, maxHops = 6): Promise<string> {
  let current = url;
  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MapResolver/1.0)",
      },
    });
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      current = loc.startsWith("http") ? loc : new URL(loc, current).toString();
      continue;
    }
    return current;
  }
  return current;
}

function extractCoords(url: string): { lat: number; lng: number } | null {
  // /@lat,lng,zoom
  const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };
  // !3dLAT!4dLNG
  const dd = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dd) return { lat: parseFloat(dd[1]), lng: parseFloat(dd[2]) };
  // q=lat,lng
  const q = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) };
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const finalUrl = await followRedirects(url);
    const coords = extractCoords(finalUrl);

    let embedUrl: string;
    if (coords) {
      // استخدام إحداثيات دقيقة — أفضل تجربة
      embedUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`;
    } else {
      // محاولة استخراج اسم المكان من المسار /maps/place/<name>/
      const place = finalUrl.match(/\/maps\/place\/([^/]+)/);
      if (place) {
        embedUrl = `https://www.google.com/maps?q=${place[1]}&output=embed`;
      } else {
        embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(finalUrl)}&output=embed`;
      }
    }

    return new Response(JSON.stringify({ embedUrl, resolvedUrl: finalUrl, coords }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
