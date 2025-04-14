/*
// functions/getUploadUrl.js
export async function onRequest(context) {
  const accountId = "your_account_id";
  const apiToken = "your_api_token";

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: new FormData(),
    }
  );

  const data = await response.json();
  return new Response(JSON.stringify({ uploadURL: data.result.uploadURL }), {
    headers: { "Content-Type": "application/json" },
  });
}
*/

//JWT model
const jwt = require("@tsndr/cloudflare-worker-jwt");
//decode the jwt token
let decodeJwt = async (req, secret) => {
  let bearer = req.get("authorization");
  console.log(bearer);
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
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
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
