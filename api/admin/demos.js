const nodemailer=require("nodemailer");
const {send,method,body,isAdmin,db,FieldValue,clean}=require("../../_lib/admin");
const escapeHtml=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function sendRejectionEmail(d,reason){
  const user=process.env.SMTP_USER,pass=process.env.SMTP_APP_PASSWORD;
  if(!user||!pass)throw new Error("Email is not configured. Add SMTP_USER and SMTP_APP_PASSWORD in Vercel.");
  const transporter=nodemailer.createTransport({service:"gmail",auth:{user,pass}});
  const safeReason=escapeHtml(reason),safeArtist=escapeHtml(d.artist||"Artist");
  await transporter.sendMail({
    from:'"AAM INSANE" <'+user+'>',
    to:d.email,
    subject:"Update on your demo submission — AAM INSANE",
    text:"Hi "+(d.artist||"there")+",\n\nThank you for submitting your demo to AAM INSANE. After review, we are unable to accept it at this time.\n\nReason: "+reason+"\n\nThank you for considering AAM INSANE. Keep creating.\n\nAAM INSANE Team",
    html:'<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;background:#101010;color:#f4f4f4"><p style="color:#d6ff3f;letter-spacing:3px;font-size:12px">AAM INSANE</p><h2>Demo submission update</h2><p>Hi '+safeArtist+',</p><p>Thank you for submitting your demo to AAM INSANE. After review, we are unable to accept it at this time.</p><div style="padding:18px;background:#1b1b1b;border-left:3px solid #d6ff3f"><b>Reason for rejection</b><p style="white-space:pre-wrap">'+safeReason+'</p></div><p>Thank you for considering AAM INSANE. Keep creating.</p><p style="color:#999">AAM INSANE Team</p></div>'
  });
}
module.exports=async(req,res)=>{
  if(!method(req,res,["POST"]))return;
  if(!isAdmin(req))return send(res,401,{error:"Unauthorized"});
  try{
    const d=body(req),id=clean(d.id,120),status=d.status;
    if(!id||!["new","reviewing","accepted","rejected"].includes(status))return send(res,400,{error:"Invalid demo status"});
    const ref=db().collection("demos").doc(id),snap=await ref.get();
    if(!snap.exists)return send(res,404,{error:"Demo submission not found."});
    const current=snap.data()||{};
    let reason="",emailSent=false;
    if(status==="rejected"){
      reason=clean(d.reason,2000);
      if(reason.length<3)return send(res,400,{error:"Please enter a rejection reason (at least 3 characters)."});
      if(!current.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email))return send(res,400,{error:"This submission has no valid email address."});
      if(current.status!=="rejected"||clean(current.rejectionReason,2000)!==reason){
        try{await sendRejectionEmail(current,reason);emailSent=true;}
        catch(error){return send(res,503,{error:"Email could not be sent. The demo status was not changed. Check Gmail SMTP settings in Vercel.",detail:process.env.NODE_ENV==="development"?String(error.message):undefined});}
      }
    }
    const update={status,reviewedAt:FieldValue.serverTimestamp()};
    if(status==="rejected"){update.rejectionReason=reason;update.rejectionEmailSentAt=FieldValue.serverTimestamp();}
    else if(status!=="rejected"){update.rejectionReason=FieldValue.delete();}
    await ref.set(update,{merge:true});
    return send(res,200,{ok:true,emailSent,message:status==="rejected"?(emailSent?"Rejected and email sent.":"Rejection already recorded; no duplicate email sent."):"Demo status updated."});
  }catch{return send(res,503,{error:"Could not update demo."});}
};