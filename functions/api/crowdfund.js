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
  //request.headers.set('Access-Control-Allow-Origin', '*');
  //request.headers.set('Access-Control-Max-Age', '86400');
  //console.log(request.headers)
  //get the search paramaters
  const { searchParams } = new URL(request.url);
  //get the id
  let id = searchParams.get("id");
  //check if there is a property id.
  if (id == null)
    return new Response(JSON.stringify({ error: "no property id" }), {
      status: 400,
    });

  // const property = context.env.DB.prepare(`SELECT property_amenities.name as amenitiesname,property.name,property.address_1,property.address_2,property.address_3,property.address_4,property.address_5,property.address_6,property.propertyType,property.state,property.description,property.internationalCost,property.internationalCurrency,property.id,property.area,property.bedrooms,property.bathrooms,property.garage from property LEFT JOIN property_amenities ON property.id = property_amenities.propertyId where property.id = ${id}`);
  const property = context.env.DB.prepare(
    `SELECT property.name,property.address_1,property.address_2,property.address_3,property.address_4,property.address_5,property.address_6,property.location,property.propertyType,property.state,property.description,property.internationalCost,property.internationalCurrency,property.id,property.area,property.bedrooms,property.bathrooms,property.garage,property.tranches,property.tranchesSold,property.tranchePrice from property where property.id = ${id}`
  );
  const propertyResult = await property.first();
  const amenities = context.env.DB.prepare(
    `SELECT property_amenities.name from property_amenities where property_amenities.propertyId = ${id}`
  );
  const amenitiesResults = await amenities.all();
  const images = context.env.DB.prepare(
    `SELECT property_images.url from property_images where property_images.propertyId = ${id}`
  );
  const imagesResults = await images.all();

  //console.log(amenitiesResults.results);
  propertyResult.amenities = amenitiesResults.results;
  propertyResult.images = imagesResults.results;

  //console.log(propertyResult)
  return new Response(JSON.stringify(propertyResult), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
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
  //request.headers.set('Access-Control-Allow-Origin', '*');
  //request.headers.set('Access-Control-Max-Age', '86400');
  //console.log(request.headers)
  //get the search paramaters
  const { searchParams } = new URL(request.url);
  //get the id
  let tranches = searchParams.get("tranches");
  let email = searchParams.get("email");
  let id = searchParams.get("id");
  console.log(email);

  const info = await context.env.DB.prepare(
    "insert into property_leads (propertyId,email,tranchesRequested) VALUES (?1,?2,?3)"
  )
    .bind(id, email, tranches)
    .run();

  //console.log(propertyResult)
  return new Response(JSON.stringify({ message: "ok" }), {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
