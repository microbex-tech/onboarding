import { Client } from "pg";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  let client;

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const source = body.source || "website";

    if (!email || !isValidEmail(email)) {
      return Response.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    client = new Client({
      connectionString: env.HYPERDRIVE.connectionString,
      connectionTimeoutMillis: 15000
    });

    await client.connect();

    await client.query(
      `
      INSERT INTO onboarding.email_leads (email, source)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      `,
      [email, source]
    );

    context.waitUntil(client.end().catch(() => {}));

    return Response.json({
      success: true,
      message: "Email submitted successfully"
    });

  } catch (error) {
    if (client) {
      context.waitUntil(client.end().catch(() => {}));
    }

    return Response.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}