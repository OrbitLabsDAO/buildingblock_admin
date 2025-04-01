/*
    This endpoint deals with users
    note: we could move login into here and  possible register

*/

const jwt = require("@tsndr/cloudflare-worker-jwt");

//set the UUID
var uuid = require("uuid");
export async function onRequestPost(context) {
  const {
    request, // same as existing Worker API
    env, // same as existing Worker API
    params, // if filename includes [id] or [[path]]
    waitUntil, // same as ctx.waitUntil in existing Worker API
    next, // used for middleware or to fetch assets
    data, // arbitrary space for passing data between middlewares
  } = context;

  //set a valid boolean
  let valid = 1;
  const contentType = request.headers.get("content-type");
  let registerData;
  if (contentType != null) {
    registerData = await request.json();
    console.log(registerData);
    //check if we want to create a user
    if (registerData.action == 1) {
      const query = context.env.DB.prepare(
        `SELECT COUNT(*) as total from user where email = '${registerData.email}'`
      );
      const queryResult = await query.first();
      if (queryResult.total == 0) {
        let apiSecret = uuid.v4();
        let verifyCode = uuid.v4();

        const info = await context.env.DB.prepare(
          "INSERT INTO user (username, email,password,apiSecret,confirmed,isBlocked,isAdmin,verifyCode) VALUES (?1, ?2,?3,?4,?5,?6,?7,?8)"
        )
          .bind(
            registerData.username,
            registerData.email,
            registerData.password,
            apiSecret,
            0,
            0,
            0,
            verifyCode
          )
          .run();

        if (info.success == true) {
          //const query = context.env.DB.prepare(`SELECT id  from user where email = '${registerData.email}' and password = '${registerData.password}'`);
          //get the result
          //const queryResult = await query.first();
          const data = {
            templateId: context.env.SIGNUPEMAILTEMPLATEID,
            to: registerData.email,
            templateVariables: {
              name: `${registerData.username}`,
              product_name: `${context.env.PRODUCTNAME}`,
              action_url: `${context.env.ADMINURL}verify?verifycode=${verifyCode}`,
              login_url: `${context.env.ADMINURL}account-login`,
              username: `${registerData.username}`,
              sender_name: `${context.env.SENDEREMAILNAME}`,
            },
          };

          //console.log("data")
          //console.log(data)
          //call the cloudflare API for a one time URL
          const responseEmail = await fetch(context.env.EMAILAPIURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          //get the repsonse
          const emailResponse = await responseEmail.json();
          //console.log(emailResponse)
          return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
          });
        } else
          return new Response(JSON.stringify({ error: "error registering" }), {
            status: 400,
          });
      } else {
        return new Response(JSON.stringify({ error: "email already exists" }), {
          status: 400,
        });
      }
    }

    //check if we want to login a user
    if (registerData.action == 2) {
      if (registerData.email == undefined || registerData.password == undefined)
        return new Response(JSON.stringify({ error: "invalid login" }), {
          status: 400,
        });

      //prepare the query
      const query = context.env.DB.prepare(
        `SELECT user.isDeleted,user.isBlocked,user.name,user.username,user.email,user.phone,user.id,user.isAdmin,userAccess.foreignId,user.apiSecret from user LEFT JOIN userAccess ON user.id = userAccess.userId where user.email = '${registerData.email}' and user.password = '${registerData.password}'`
      );
      //get the result
      //note : we could make this return first and not all
      const queryResult = await query.all();
      //check the length
      if (queryResult.results.length > 0) {
        //set the user
        let user = queryResult.results[0];

        //check if they are blocked
        if (user.isBlocked == 1)
          return new Response(
            JSON.stringify({ error: "user account is blocked" }),
            { status: 400 }
          );

        //check if they are deleted
        if (user.isDeleted == 1)
          return new Response(
            JSON.stringify({ error: "user does not exist" }),
            { status: 400 }
          );

        if (user.isAdmin == 1) {
          //prepare the query
          const query2 = context.env.DB.prepare(
            `SELECT COUNT(*) as total from property where isDeleted = 0`
          );
          const queryResult2 = await query2.first();
          user.foreignCount = queryResult2.total;
        } else {
          //prepare the query
          const query2 = context.env.DB.prepare(
            `SELECT COUNT(*) as total from property_owner where userId = ${user.id} and isDeleted = 0 `
          );
          const queryResult2 = await query2.first();
          user.foreignCount = queryResult2.total;
        }
        //sign the token
        const token = await jwt.sign(
          {
            id: user.id,
            password: user.password,
            username: user.username,
            isAdmin: user.isAdmin,
          },
          env.SECRET
        );
        // Verifing token
        const isValid = await jwt.verify(token, env.SECRET);
        //check it is true
        if (isValid == true) {
          //note: we are sending down the isAdmin status the reason for this is it makese certain front end tasks easier but for any
          //      read / writes to the database we will always check the entry we have for them before we allow it to happebn.
          return new Response(
            JSON.stringify({
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
            }),
            { status: 200 }
          );
        } else {
          return new Response(JSON.stringify({ error: "invalid login" }), {
            status: 400,
          });
        }
      } else {
        return new Response(
          JSON.stringify({ error: "username  / password issue" }),
          { status: 400 }
        );
      }
    }

    //check if we want to do forgot password flow
    //todo : this code.
    if (registerData.action == 3) {
      //check the email exists
      const email = registerData.email;
      const query = context.env.DB.prepare(
        `SELECT COUNT(*) as total from user where email = '${email}'`
      );
      const queryResult = await query.first();
      if (queryResult.total > 0) {
        //updat the database
        let verifyCode = uuid.v4();
        const stmt = await context.env.DB.prepare(
          `update user set resetPassword = 1,verifyCode='${verifyCode}'  where email = '${email}'`
        ).run();
        if (stmt.success == true) {
          const query = context.env.DB.prepare(
            `SELECT username  from user where email = '${email}'`
          );
          //get the result
          const queryResult = await query.first();
          const data = {
            templateId: context.env.FORGOTPASSWORDEMAILTEMPLATEID,
            to: email,
            templateVariables: {
              name: `${queryResult.username}`,
              product_name: `${context.env.PRODUCTNAME}`,
              action_url: `${context.env.ADMINURL}reset-password?resetcode=${verifyCode}`,
            },
          };

          //console.log("data")
          //console.log(data)
          //call the cloudflare API for a one time URL
          const responseEmail = await fetch(context.env.EMAILAPIURL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          const emailResponse = await responseEmail.json();

          return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
          });
        } else
          return new Response(JSON.stringify({ error: "code not found" }), {
            status: 400,
          });
      } else {
        return new Response(JSON.stringify({ error: "email not found" }), {
          status: 400,
        });
      }

      //set the resetpassword code
      //send the email
      return new Response(JSON.stringify({ status: "ok" }), { status: 200 });
    }

    //verify the user
    if (registerData.action == 4) {
      const verifyCode = registerData.verifycode;
      const query = context.env.DB.prepare(
        `SELECT COUNT(*) as total from user where verifyCode = '${verifyCode}'`
      );
      const queryResult = await query.first();
      if (queryResult.total > 0) {
        //updat the database
        const stmt = await context.env.DB.prepare(
          `update user set isVerified = 1 where verifyCode = '${verifyCode}'`
        ).run();
        if (stmt.success == true)
          return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
          });
        else
          return new Response(JSON.stringify({ error: "code not found" }), {
            status: 400,
          });
      } else {
        return new Response(JSON.stringify({ error: "user not found" }), {
          status: 400,
        });
      }
    }

    //reset the password
    if (registerData.action == 5) {
      const resetCode = registerData.resetcode;
      const password = registerData.password;
      const verifyCode = registerData.verifycode;
      const query = context.env.DB.prepare(
        `SELECT COUNT(*) as total from user where verifyCode = '${resetCode}'`
      );
      const queryResult = await query.first();
      //console.log(queryResult.total )
      if (queryResult.total > 0) {
        const stmt = await context.env.DB.prepare(
          `update user set resetPassword = 0,password='${password}',verifyCode = '' where verifyCode = '${resetCode}'`
        ).run();
        if (stmt.success == true)
          return new Response(JSON.stringify({ status: "ok" }), {
            status: 200,
          });
        else
          return new Response(JSON.stringify({ error: "code not found" }), {
            status: 400,
          });
      } else {
        return new Response(JSON.stringify({ error: "reset code not found" }), {
          status: 400,
        });
      }
    }
  } else {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 400,
    });
  }
}
