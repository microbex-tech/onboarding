function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const email = body.email?.trim().toLowerCase();
    const source = body.source || "website";

    // Validation
    if (!email || !isValidEmail(email)) {
      return Response.json(
        { success: false, data: null, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Optional observability
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";

    // Idempotent insert
    const result = await env.HYPERDRIVE.prepare(
      `
      INSERT INTO onboarding.email_leads (email, source)
      VALUES ($1, $2)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, source, status, created_at
      `
    )
      .bind(email, source)
      .first();

    console.log("Signup:", email, "IP:", ip);

    return Response.json({
      success: true,
      data: result || { email, message: "Already exists" },
      error: null
    });

  } catch (error) {
    console.error("API ERROR:", error);

    return Response.json(
      { success: false, data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}