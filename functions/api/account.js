const bcrypt = require("bcryptjs");
const jwt = require("@tsndr/cloudflare-worker-jwt");
const uuid = require("uuid");

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

  /**
   * Handle the register user endpoint
   * @param {Object} body The request body
   * @param {Object} context The context of the request
   * @return {Promise<Response>}
   */
  async function handleRegister(body, context) {
    const { username, email, password } = body;
    if (!username || !email || !password) {
      return jsonResponse(400, {
        error: "Username, email, and password are required.",
      });
    }

    // Check if the email already exists
    const queryResult = await context.env.DB.prepare(
      "SELECT COUNT(*) as total FROM adminuser WHERE email = ?"
    )
      .bind(email)
      .first();

    if (queryResult.total > 0) {
      return jsonResponse(400, { error: "Email already exists." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate API secret and verification code
    const apiSecret = uuid.v4();
    const verifyCode = uuid.v4();

    // Insert the user into the database
    const info = await context.env.DB.prepare(
      "INSERT INTO adminuser (username, email, password, apiSecret, confirmed, isBlocked, isAdmin, verifyCode) VALUES (?, ?, ?, ?, 0, 0, 0, ?)"
    )
      .bind(username, email, hashedPassword, apiSecret, verifyCode)
      .run();

    if (!info.success) {
      return jsonResponse(400, { error: "Error registering. Try again." });
    }

    // Send verification email if configured...
    if (context.env.EMAILAPIURL) {
      const data = {
        templateId: context.env.SIGNUPEMAILTEMPLATEID,
        to: email,
        templateVariables: {
          name: username,
          product_name: context.env.PRODUCTNAME,
          action_url: `${context.env.ADMINURL}verify?verifycode=${verifyCode}`,
          login_url: `${context.env.ADMINURL}account-login`,
          username: username,
          sender_name: context.env.SENDEREMAILNAME,
        },
      };
      const responseEmail = await fetch(context.env.EMAILAPIURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      await responseEmail.json(); // Process email response if necessary
    }

    return jsonResponse(200, { status: "ok" });
  }

  /**
   * Handle the login user endpoint
   * @param {Object} body The request body
   * @param {Object} context The context of the request
   * @return {Promise<Response>}
   */
  async function handleLogin(body, context) {
    const { email, password } = body;
    if (!email || !password) {
      return jsonResponse(400, { error: "Email and password are required." });
    }

    try {
      const user = await fetchUserByEmail(email, context);
      if (!user) return jsonResponse(400, { error: "User not found." });

      // Compare the password hash

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid)
        return jsonResponse(400, { error: "Invalid password." });

      if (user.isBlocked)
        return jsonResponse(400, { error: "User is blocked." });
      if (user.isDeleted)
        return jsonResponse(400, { error: "User does not exist." });

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

  // Fetch User by email
  async function fetchUserByEmail(email, context) {
    const query = context.env.DB.prepare(`
      SELECT 
        adminuser.isDeleted, adminuser.isBlocked, adminuser.name, adminuser.username, 
        adminuser.email, adminuser.phone, adminuser.id, adminuser.isAdmin, 
        adminuser.password, adminuser.apiSecret,
        userAccess.foreignId 
      FROM adminuser 
      LEFT JOIN userAccess ON adminuser.id = userAccess.userId 
      WHERE adminuser.email = ?
    `);

    const result = await query.bind(email).all();
    return result.results.length > 0 ? result.results[0] : null;
  }

  // Create JWT Token
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

  // Handle unknown actions
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
