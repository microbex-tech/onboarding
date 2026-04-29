import { Client } from "pg";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const client = new Client({
    connectionString: env.HYPERDRIVE.connectionString,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000
  });

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

    await client.connect();

    const result = await client.query(
      `
      INSERT INTO onboarding.email_leads (email, source)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, source, status, created_at
      `,
      [email, source]
    );

    context.waitUntil(client.end().catch(() => {}));

    return Response.json({
      success: true,
      data: result.rows[0] || { email, message: "Already exists" }
    });

  } catch (error) {
    context.waitUntil(client.end().catch(() => {}));

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}