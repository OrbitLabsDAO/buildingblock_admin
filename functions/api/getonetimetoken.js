//JWT model
const jwt = require("@tsndr/cloudflare-worker-jwt");
//decode the jwt token
let decodeJwt = async (req, secret) => {
  let bearer = req.get("authorization");
  let details = "";
  if (bearer != null) {
    bearer = bearer.replace("Bearer ", "");
    details = await jwt.decode(bearer, secret);
  }
  return details;
};

export async function onRequestGet(context) {
  //build the paramaters
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
  } = context;

  let theToken = await decodeJwt(request.headers, env.SECRET);
  if (theToken == "")
    return new Response(JSON.stringify({ error: "Token required" }), {
      status: 400,
    });

  //call the cloudflare API for a one time URL
  const response = await fetch(context.env.CLOUDFLAREURL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.env.BEARERTOKEN}`,
    },
  });
  //get the repsonse
  const cfresponse = await response.json();
  //return the URL
  return new Response(
    JSON.stringify({
      url: `${cfresponse.result.uploadURL}`,
    }),
    { status: 200 }
  );
}
