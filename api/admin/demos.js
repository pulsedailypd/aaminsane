const nodemailer=require("nodemailer");
const {send,method,body,isAdmin,db,FieldValue,clean}=require("../../_lib/admin");
const escapeHtml=value=>String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
async function sendDecisionEmail(d,status,note){
  const user=process.env.SMTP_USER,pass=process.env.SMTP_APP_PASSWORD;
  if(!user||!pass)throw new Error("Email is not configured. Add SMTP_USER and SMTP_APP_PASSWORD in Vercel.");
  const accepted=status==="accepted";
  const transporter=nodemailer.createTransport({service:"gmail",auth:{user,pass}});
  const artist=d.artist||"there";
  const subject=accepted?"Your demo has been accepted — AAM INSANE":"Update on your demo submission — AAM INSANE";
  const heading=accepted?"Your demo is accepted!":"Demo submission update";
  const intro=accepted
    ?"We’re happy to let you know that your demo has been accepted by AAM INSANE. Our team will contact you about the next steps."
    :"Thank you for submitting your demo to AAM INSANE. After review, we are unable to accept it at this time.";
  const noteLabel=accepted?"Message from AAM INSANE":"Reason for rejection";
  const plain=accepted
    ?"Hi "+artist+",\n\n"+intro+(note?"\n\nMessage from our team: "+note:"")+"\n\nThank you for sharing your music with us.\n\nAAM INSANE Team"
    :"Hi "+artist+",\n\n"+intro+"\n\nReason: "+note+"\n\nThank you for considering AAM INSANE. Keep creating.\n\nAAM INSANE Team";
  await transporter.sendMail({
    from:'"AAM INSANE" <'+user+'>',to:d.email,subject,text:plain,
    html:'<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;background:#101010;color:#f4f4f4"><p style="color:#d6ff3f;letter-spacing:3px;font-size:12px">AAM INSANE</p><h2>'+heading+'</h2><p>Hi '+escapeHtml(artist)+',</p><p>'+intro+'</p>'+(note?'<div style="padding:18px;background:#1b1b1b;border-left:3px solid #d6ff3f"><b>'+noteLabel+'</b><p style="white-space:pre-wrap">'+escapeHtml(note)+'</p></div>':'')+'<p>Thank you for sharing your music with us.</p><p style="color:#999">AAM INSANE Team</p></div>'
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
    let note="",emailSent=false;
    if(status==="rejected"||status==="accepted"){
      note=clean(d.reason,2000);
      if(status==="rejected"&&note.length<3)return send(res,400,{error:"Please enter a rejection reason (at least 3 characters)."});
      if(!current.email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(current.email))return send(res,400,{error:"This submission has no valid email address."});
      const noteField=status==="accepted"?"acceptanceMessage":"rejectionReason";
      const sentField=status==="accepted"?"acceptanceEmailSentAt":"rejectionEmailSentAt";
      if(current.status!==status||clean(current[noteField],2000)!==note){
        try{await sendDecisionEmail(current,status,note);emailSent=true;}
        catch(error){return send(res,503,{error:"Email could not be sent. The demo status was not changed. Check Gmail SMTP settings in Vercel.",detail:process.env.NODE_ENV==="development"?String(error.message):undefined});}
      }
      const update={status,reviewedAt:FieldValue.serverTimestamp()};
      update[noteField]=note||FieldValue.delete();
      update[status==="accepted"?"rejectionReason":"acceptanceMessage"]=FieldValue.delete();
      if(emailSent)update[sentField]=FieldValue.serverTimestamp();
      await ref.set(update,{merge:true});
      return send(res,200,{ok:true,emailSent,message:emailSent?(status==="accepted"?"Accepted and email sent.":"Rejected and email sent."):(status==="accepted"?"Acceptance already recorded; no duplicate email sent.":"Rejection already recorded; no duplicate email sent.")});
    }
    await ref.set({status,reviewedAt:FieldValue.serverTimestamp(),rejectionReason:FieldValue.delete(),acceptanceMessage:FieldValue.delete()},{merge:true});
    return send(res,200,{ok:true,emailSent:false,message:"Demo status updated."});
  }catch{return send(res,503,{error:"Could not update demo."});}
};