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

    // ✅ Correct way: use pg + Hyperdrive connectionString
    client = new Client({
      connectionString: env.HYPERDRIVE.connectionString
    });

    await client.connect();

    const result = await client.query(
      `
      INSERT INTO onboarding.email_leads (email, source)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, created_at
      `,
      [email, source]
    );

    return Response.json({
      success: true,
      data: result.rows[0] || { email, message: "Already exists" }
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );

  } finally {
    if (client) {
      await client.end();
    }
  }
}