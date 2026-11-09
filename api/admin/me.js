const {send,method,isAdmin}=require("../../_lib/admin");
module.exports=(req,res)=>{if(!method(req,res,["GET"]))return;const ok=isAdmin(req);return send(res,ok?200:401,{authenticated:ok});};
