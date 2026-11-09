const {send,method,cookie}=require("../../_lib/admin");
module.exports=(req,res)=>{if(!method(req,res,["POST"]))return;return send(res,200,{ok:true},{"Set-Cookie":cookie("",0)});};
