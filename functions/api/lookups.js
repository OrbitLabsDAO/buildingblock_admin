async function parseRequestBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
export async function onRequestPost(context) {
  //build the paramaters
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  const body = await parseRequestBody(request);

  const dataResults = [];

  for (const lookUp of body) {
    //we are going to assume a look up always have a name field, could be bad
    const query = `SELECT ${lookUp.foreignId},name FROM ${lookUp.foreignTable}`;
    //console.log(query);
    const data = context.env.DB.prepare(query);
    const tmp = await data.all();
    tmp.results.forEach((result) => {
      console.log(lookUp.fieldName);
      result.fieldName = lookUp.fieldName;
    });
    dataResults.push(tmp.results);
  }
  const flatResults = dataResults.flat();
  //console.log(propertyResult)
  return new Response(JSON.stringify({ data: flatResults }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
