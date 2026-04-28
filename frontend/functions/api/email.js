import postgres from "postgres";

const json = (payload, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, source = "website" } = body;

    if (!email || !isValidEmail(email)) {
      return json({ success: false, message: "Invalid email format" }, 400);
    }

    if (!env.HYPERDRIVE || !env.HYPERDRIVE.connectionString) {
      return json({ success: false, message: "Hyperdrive binding is not configured" }, 500);
    }

    const sql = postgres(env.HYPERDRIVE.connectionString, {
      prepare: false
    });

    try {
      const result = await sql`
        INSERT INTO onboarding.email_leads (email, source, status)
        VALUES (${email}, ${source}, ${"active"})
        RETURNING id, email, source, status, created_at
      `;

      return json({
        success: true,
        message: "Email submitted successfully",
        data: result[0]
      });
    } finally {
      await sql.end();
    }
  } catch (error) {
    if (error && error.code === "23505") {
      return json({ success: false, message: "Email already exists" }, 409);
    }

    console.error("Cloudflare function error:", error);
    return json({ success: false, message: "Internal server error" }, 500);
  }
}

export async function onRequestGet() {
  return json({ success: true, message: "Microbex Onboarding API is running on Cloudflare" });
}
