function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;

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

    // Hyperdrive connection (CORRECT WAY)
    const client = await env.HYPERDRIVE.connect();

    const result = await client.query(
      `
      INSERT INTO onboarding.email_leads (email, source)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, created_at
      `,
      [email, source]
    );

    await client.end();

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
   }
}
