const jwt = require("@tsndr/cloudflare-worker-jwt");

//set the UUID
var uuid = require("uuid");

export async function onRequest(context) {
  const { request } = context;
  const { method } = request;

  // Utility to parse JSON body
  async function parseRequestBody(request) {
    try {
      return await request.json();
    } catch {
      return {};
    }
  }

  // Utility response
  function jsonResponse(status, data) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Action Handlers
  async function handleRegister(body, context) {
    const { email, password } = body;
    if (!email || !password) {
      return jsonResponse(400, { error: "Email and password are required." });
    }

    // Perform registration logic here
    return jsonResponse(201, { message: "User registered", data: { email } });
  }

  async function handleLogin(body, context) {
    const { email, password } = body;
    if (!email || !password) {
      return jsonResponse(400, { error: "Email and password are required." });
    }

    try {
      const user = await fetchUser(email, password, context);
      if (!user) return jsonResponse(400, { message: "User not found" });
      // Check user status
      if (user.isBlocked)
        return jsonResponse(400, { error: "User account is blocked" });
      if (user.isDeleted)
        return jsonResponse(400, { error: "User does not exist" });
      // Generate and verify token
      const token = await createToken(user, context.env.SECRET);
      const isValid = await jwt.verify(token, context.env.SECRET);
      if (isValid) {
        return jsonResponse(200, {
          jwt: token,
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            foreignCount: user.foreignCount,
            secret: user.apiSecret,
          },
        });
      }

      return jsonResponse(400, { error: "Token verification failed" });
    } catch (error) {
      console.error(error);
      return jsonResponse(500, { error: "Internal Server Error" });
    }
  }

  // Fetch User
  async function fetchUser(email, password, context) {
    const query = context.env.DB.prepare(`
    SELECT 
      user.isDeleted, user.isBlocked, user.name, user.username, 
      user.email, user.phone, user.id, user.isAdmin, 
      userAccess.foreignId, user.apiSecret 
    FROM user 
    LEFT JOIN userAccess ON user.id = userAccess.userId 
    WHERE user.email = '${email}' AND user.password = '${password}'
  `);

    const result = await query.all();
    return result.results.length > 0 ? result.results[0] : null;
  }

  // Create Token
  async function createToken(user, secret) {
    return await jwt.sign(
      {
        id: user.id,
        password: user.password,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      secret
    );
  }

  // JSON Response Helper
  function jsonResponse(status, body) {
    return new Response(JSON.stringify(body), { status });
  }

  async function handleUnknownAction(action) {
    return jsonResponse(400, { error: `Unknown action: ${action}` });
  }

  // Action Dispatcher
  const actionMap = {
    1: handleRegister,
    2: handleLogin,
  };

  // Route Handler
  if (method === "POST") {
    try {
      const body = await parseRequestBody(request);
      const { action } = body;

      if (!action) {
        return jsonResponse(400, { error: "Action is required." });
      }

      // Call the appropriate handler or handle unknown actions
      const actionHandler = actionMap[action];
      if (actionHandler) {
        // Pass context to the handler
        return actionHandler(body, context);
      } else {
        return handleUnknownAction(action);
      }
    } catch (error) {
      return jsonResponse(500, {
        error: "Internal Server Error",
        details: error.message,
      });
    }
  }

  // Unsupported method handler
  return jsonResponse(405, { error: "Method Not Allowed" });
}
