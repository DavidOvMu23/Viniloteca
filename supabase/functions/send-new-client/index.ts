// Este archivo sirve para recibir los datos del nuevo cliente y lee en supabase
// los expo_push_token de los usuarios para enviarles una notificacion push, esta funcion se va a ejecutar
// cada vez que se registre un nuevo cliente

// @ts-nocheck

//Esto sirve para crear un servidor web, lo necesitamos por que su funcion va a ser
//recibir una peticion http y responder a ella, en este caso, cuando se registre un nuevo usuario
//se va a enviar una peticion a esta funcion y esta va a enviar las notificaciones push
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

//Definimos las variables de entorno que necesitamos
//Estas variables de entorno las sacamos de un env de supabase
const PROJECT_URL = Deno.env.get("PROJECT_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");

//Definimos la funcion que va a recibir la peticion http
serve(async (req: Request) => {
  try {
    //Esto es para permitir peticiones desde cualquier origen
    //si la peticion es de tipo OPTIONS, se responde con un 200 y se sale de la funcion
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    //definimos el payload, que es el cuerpo de la peticion
    const payload = await req.json().catch(() => ({}));
    //definimos el nombre completo del usuario
    const fullName = payload?.fullName;

    //si no se recibe el nombre completo, se responde con un 400
    if (!fullName) {
      return new Response(JSON.stringify({ error: "fullName required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    //si no se reciben las variables de entorno, se responde con un 500
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

    //si la peticion no es exitosa, se responde con un 500
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

    //convertimos la respuesta en json
    const profiles = await profilesRes.json();
    //obtenemos los tokens de los usuarios
    const tokens: string[] = (profiles || [])
      .map((p: any) => p.expo_push_token)
      .filter(Boolean);

    //si no se reciben tokens, se responde con un 200
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    //definimos el tamaño del chunk
    const chunkSize = 100;
    //definimos el titulo de la notificacion
    const title = "Nuevo cliente añadido";
    //definimos el cuerpo de la notificacion
    const body = `Se ha añadido ${fullName} a la lista de clientes.`;

    //recorremos los tokens en chunks de 100
    for (let i = 0; i < tokens.length; i += chunkSize) {
      //obtenemos el chunk de tokens
      const chunk = tokens.slice(i, i + chunkSize);
      //creamos los mensajes
      const messages = chunk.map((t) => ({
        to: t,
        title,
        body,
        data: { type: "NEW_CLIENT", fullName },
      }));

      //enviamos los mensajes a expo
      try {
        const resp = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(messages),
        });

        //si la peticion no es exitosa, se responde con un 500
        if (!resp.ok) {
          const text = await resp.text();
          console.error("Expo push send error:", resp.status, text);
        }
      } catch (err) {
        //si hay un error, se responde con un 500
        console.error("Error sending to expo:", err);
      }
    }

    //si todo es exitoso, se responde con un 200
    return new Response(
      //convertimos la respuesta en json
      JSON.stringify({ success: true, sent: tokens.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    //si hay un error, se responde con un 500
    console.error("Unhandled error in send-new-client function:", e);
    return new Response(JSON.stringify({ error: "internal" }), { status: 500 });
  }
});
