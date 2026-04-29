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

    // Use Hyperdrive with prepare and bind
    const result = await env.HYPERDRIVE.prepare(
      `INSERT INTO onboarding.email_leads (email, source)
       VALUES (?, ?)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, created_at`
    ).bind(email, source).run();


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
