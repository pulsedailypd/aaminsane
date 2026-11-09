const crypto = require("crypto");
const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const COOKIE = "aam_session";
const TTL = 43200;
function send(res, status, data, headers = {}) {
  res.statusCode = status; res.setHeader("Content-Type","application/json; charset=utf-8");
  res.setHeader("Cache-Control","no-store"); Object.entries(headers).forEach(([k,v])=>res.setHeader(k,v));
  res.end(JSON.stringify(data));
}
function method(req,res,allowed){if(!allowed.includes(req.method)){send(res,405,{error:"Method not allowed"},{Allow:allowed.join(", ")});return false;}return true;}
function body(req){if(req.body&&typeof req.body==="object")return req.body;try{return JSON.parse(req.body||"{}");}catch{return {};}}
function secret(name,min=24){const v=process.env[name];if(!v||v.length<min)throw new Error(name+" is not configured");return v;}
function equal(a,b){const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));return x.length===y.length&&crypto.timingSafeEqual(x,y);}
function signature(payload){return crypto.createHmac("sha256",secret("SESSION_SECRET",32)).update(payload).digest("base64url");}
function makeSession(){const p=Buffer.from(JSON.stringify({role:"admin",exp:Math.floor(Date.now()/1000)+TTL})).toString("base64url");return p+"."+signature(p);}
function isAdmin(req){try{const c=(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="));if(!c)return false;const parts=decodeURIComponent(c.slice(COOKIE.length+1)).split(".");if(parts.length!==2||!equal(signature(parts[0]),parts[1]))return false;const p=JSON.parse(Buffer.from(parts[0],"base64url").toString());return p.role==="admin"&&p.exp>Math.floor(Date.now()/1000);}catch{return false;}}
function cookie(value,maxAge){const secure=process.env.NODE_ENV==="production"||process.env.VERCEL==="1";return COOKIE+"="+(value||"")+"; HttpOnly; Path=/; SameSite=Strict; Max-Age="+maxAge+(secure?"; Secure":"");}
function db(){if(!getApps().length){let c;try{c=JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT||"{}");}catch{throw new Error("FIREBASE_SERVICE_ACCOUNT must be valid JSON");}if(!c.project_id||!c.client_email||!c.private_key)throw new Error("Firebase service account is incomplete");initializeApp({credential:cert(c)});}return getFirestore();}
function clean(v,n=500){return String(v||"").trim().slice(0,n);}
module.exports={send,method,body,secret,equal,makeSession,isAdmin,cookie,db,FieldValue,clean};
