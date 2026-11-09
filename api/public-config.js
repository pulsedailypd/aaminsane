const {send,method,db}=require("../_lib/admin");
module.exports=async(req,res)=>{if(!method(req,res,["GET"]))return;try{const s=await db().collection("settings").doc("public").get();return send(res,200,{demoEnabled:s.exists&&s.data().demoEnabled===true});}catch{return send(res,503,{error:"Settings service unavailable"});}};
