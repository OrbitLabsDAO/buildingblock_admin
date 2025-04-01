export async function onRequest(context) {
  const { request, env } = context;
  const { method } = request;
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);

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

  // Handle HTTP methods
  try {
    switch (method) {
      case "GET": {
        // Example: http://localhost:8788/api?name=John
        const { name = "world" } = params;
        return jsonResponse(200, { message: `Hello, ${name}!` });
      }

      case "POST": {
        // Example: { "name": "John", "age": 30 }
        const body = await parseRequestBody(request);
        const { name, age } = body;

        if (!name || !age) {
          return jsonResponse(400, { error: "Name and age are required" });
        }

        return jsonResponse(201, {
          message: "Resource created successfully",
          data: { name, age },
        });
      }

      case "PUT": {
        // Example: { "id": 1, "name": "John Updated" }
        const body = await parseRequestBody(request);
        const { id, name } = body;

        if (!id || !name) {
          return jsonResponse(400, { error: "ID and name are required" });
        }

        return jsonResponse(200, {
          message: `Resource with ID ${id} updated`,
          data: { id, name },
        });
      }

      case "DELETE": {
        // Example: http://localhost:8788/api?id=1
        const { id } = params;

        if (!id) {
          return jsonResponse(400, { error: "ID is required" });
        }

        return jsonResponse(200, {
          message: `Resource with ID ${id} deleted successfully`,
        });
      }

      default:
        return jsonResponse(405, { error: "Method Not Allowed" });
    }
  } catch (error) {
    return jsonResponse(500, {
      error: "Internal Server Error",
      details: error.message,
    });
  }
}
