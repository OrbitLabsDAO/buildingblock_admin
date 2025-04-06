//JWT model
const jwt = require("@tsndr/cloudflare-worker-jwt");
const isInvalid = (val) =>
  val === null ||
  val === undefined ||
  val === "" ||
  val === "null" ||
  val === "undefined";

// Decode and validate the JWT token
const decodeJwt = async (headers, secret) => {
  let bearer = headers.get("authorization");
  if (!bearer) return null;

  bearer = bearer.replace("Bearer ", "");
  const isValid = await jwt.verify(bearer, secret);
  if (!isValid) return null;

  return await jwt.decode(bearer);
};

export async function onRequest(context) {
  //get the vars we care about
  const { request, env, params } = context;
  //get the methods
  const method = request.method.toUpperCase();

  switch (method) {
    case "GET":
      return handleGet(request, env, params, context);
    case "PUT":
      return handlePut(request, env, params, context);
    default:
      return new Response("Method Not Allowede", { status: 405 });
  }
}

async function handleGet(request, env, params, context) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id"); // Get 'id' from query string
  const tableName = "adminuser"; // assuming you're actually querying the "user" table

  // Decode JWT
  const token = await decodeJwt(request.headers, env.SECRET);

  if (!token) {
    return new Response(JSON.stringify({ error: "Invalid or missing token" }), {
      status: 401,
    });
  }

  if (id == null) {
    return new Response(JSON.stringify({ error: "ID is required" }), {
      status: 400,
    });
  }

  // Sanitize the ID to ensure it's numeric if expected
  if (isNaN(id)) {
    return new Response(JSON.stringify({ error: "ID must be a number" }), {
      status: 400,
    });
  }

  const queryStr = `SELECT name, email, phone, username FROM ${tableName} WHERE id = ${id}`;

  try {
    const result = await env.DB.prepare(queryStr).first(); // Only fetch the first row

    if (!result) {
      return new Response(JSON.stringify({ error: "Record not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ data: result }), {
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Query failed", details: err.message }),
      {
        status: 500,
      }
    );
  }
}

export async function handlePut(request, env, params, context) {
  let data;
  try {
    data = await request.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
    });
  }

  const {
    id,
    name,
    email,
    phone,
    username,
    changePassword,
    oldPassword,
    newPassword,
  } = data;

  // Decode JWT
  const token = await decodeJwt(request.headers, env.SECRET);
  if (!token) {
    return new Response(JSON.stringify({ error: "Invalid or missing token" }), {
      status: 401,
    });
  }

  // Check if the token's payload ID matches the provided ID
  if (token.payload.id !== id) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized: Token ID does not match request ID",
      }),
      { status: 403 }
    );
  }

  // Password check and update
  if (changePassword) {
    if (!oldPassword || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Old and new passwords required" }),
        {
          status: 400,
        }
      );
    }

    // Get current password
    try {
      const checkQuery = `SELECT password FROM adminuser WHERE id = ${id}`;
      const result = await env.DB.prepare(checkQuery).first();

      if (!result || result.password !== oldPassword) {
        return new Response(
          JSON.stringify({ error: "Old password is incorrect" }),
          {
            status: 403,
          }
        );
      }

      const updatePasswordQuery = `
        UPDATE adminuser
        SET password = '${newPassword}'
        WHERE id = ${id};
      `;
      await env.DB.prepare(updatePasswordQuery).run();
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Error checking/updating password" }),
        {
          status: 500,
        }
      );
    }
  }

  if (!id || !name || !email || !phone || !username) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  // Update other fields
  const updateUserQuery = `
    UPDATE adminuser
    SET name = '${name}',
        email = '${email}',
        phone = '${phone}',
        username = '${username}'
    WHERE id = ${id};
  `;

  //console.log(updateUserQuery);

  try {
    const result = await env.DB.prepare(updateUserQuery).run();

    if (result.meta.changes > 0) {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
      });
    } else {
      return new Response(
        JSON.stringify({ error: "User not found or no changes" }),
        {
          status: 404,
        }
      );
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
