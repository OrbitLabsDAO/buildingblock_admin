/**
 * Handles API requests for user account management.
 *
 * Supports the following HTTP methods:
 * - POST: Handles registration and login actions.
 *   Request body must contain an "action" property with one of the following values:
 *   - 1: Register a new user.
 *   - 2: Login an existing user.
 *
 * Returns a JSON response object with a status code and optional error details.
 * - 200: User logged in successfully.
 * - 201: User registered successfully.
 * - 400: Bad request (missing or invalid fields, unknown action).
 * - 405: Method not allowed.
 * - 500: Internal server error.
 */
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
  async function handleRegister(body) {
    const { email, password } = body;
    if (!email || !password) {
      return jsonResponse(400, { error: "Email and password are required." });
    }

    // Perform registration logic here
    return jsonResponse(201, { message: "User registered", data: { email } });
  }

  async function handleLogin(body) {
    const { email, password } = body;
    if (!email || !password) {
      return jsonResponse(400, { error: "Email and password are required." });
    }

    // Perform login logic here
    return jsonResponse(200, { message: "User logged in", data: { email } });
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
      const actionHandler =
        actionMap[action.toLowerCase()] || handleUnknownAction;
      return actionHandler(body);
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
