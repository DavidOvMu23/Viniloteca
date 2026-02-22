// Desactivar comprobaciones TS en este archivo (runtime Deno en Supabase Functions)
// VSCode puede marcar errores porque no está configurado para Deno; esto
// no afecta al despliegue en Supabase (Deno runtime).
// @ts-nocheck
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

// Use secret names that do NOT start with `SUPABASE_` because
// the Supabase CLI disallows secrets starting with that prefix.
const PROJECT_URL = Deno.env.get("PROJECT_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const payload = await req.json().catch(() => ({}));
    const fullName = payload?.fullName;

    if (!fullName) {
      return new Response(JSON.stringify({ error: "fullName required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!PROJECT_URL || !SERVICE_ROLE_KEY) {
      console.error("Missing PROJECT_URL or SERVICE_ROLE_KEY");
      return new Response(JSON.stringify({ error: "server misconfigured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Recuperar tokens desde la tabla profiles usando la Service Role key
    const profilesRes = await fetch(
      `${PROJECT_URL}/rest/v1/profiles?select=expo_push_token`,
      {
        headers: {
          apikey: SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!profilesRes.ok) {
      const text = await profilesRes.text();
      console.error("Error fetching profiles:", profilesRes.status, text);
      return new Response(
        JSON.stringify({ error: "error fetching profiles" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const profiles = await profilesRes.json();
    const tokens: string[] = (profiles || [])
      .map((p: any) => p.expo_push_token)
      .filter(Boolean);

    if (tokens.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chunkSize = 100;
    const title = "Nuevo cliente añadido";
    const body = `Se ha añadido ${fullName} a la lista de clientes.`;

    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      const messages = chunk.map((t) => ({
        to: t,
        title,
        body,
        data: { type: "NEW_CLIENT", fullName },
      }));

      try {
        const resp = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messages),
        });

        if (!resp.ok) {
          const text = await resp.text();
          console.error("Expo push send error:", resp.status, text);
        }
      } catch (err) {
        console.error("Error sending to expo:", err);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: tokens.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("Unhandled error in send-new-client function:", e);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
});
