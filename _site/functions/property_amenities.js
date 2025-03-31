export async function onRequest(context) {
  const { request, env, params } = context;
  const method = request.method.toUpperCase();

  switch (method) {
    case "GET":
      return handleGet(request, env, params);
    case "POST":
      return handlePost(request, env, params);
    case "PUT":
      return handlePut(request, env, params);
    case "DELETE":
      return handleDelete(request, env, params);
    default:
      return new Response("Method Not Allowed", { status: 405 });
  }
}

async function handleGet(request, env, params) {
  try {
    const { id } = params;
    if (id) {
      // Fetch single record
      return new Response(JSON.stringify({ message: "GET single ${table} by ID", id }), { status: 200 });
    } else {
      // Fetch all records
      return new Response(JSON.stringify({ message: "GET all ${table}" }), { status: 200 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

async function handlePost(request, env, params) {
  try {
    const data = await request.json();
    return new Response(JSON.stringify({ message: "POST create new ${table}", data }), { status: 201 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

async function handlePut(request, env, params) {
  try {
    const { id } = params;
    const data = await request.json();
    return new Response(JSON.stringify({ message: "PUT update ${table} by ID", id, data }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

async function handleDelete(request, env, params) {
  try {
    const { id } = params;
    return new Response(JSON.stringify({ message: "DELETE ${table} by ID", id }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}