const {send,method,body,secret,equal,makeSession,cookie}=require("../../_lib/admin");
module.exports=(req,res)=>{if(!method(req,res,["POST"]))return;try{if(!equal(body(req).password,secret("ADMIN_PASSWORD",12)))return send(res,401,{error:"Incorrect password"});return send(res,200,{ok:true},{ "Set-Cookie":cookie(makeSession(),43200)});}catch(e){return send(res,500,{error:e.message});}};
