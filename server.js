import express from "express";
import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
const app = express();
app.use(express.json());
const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.PHONE_ID;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "sahrab123";
const GEMINI_KEY = process.env.GEMINI_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_KEY);
app.get("/", (req,res)=>res.send("SAHRAB AI Running"));
app.get("/webhook", (req,res)=>{
  if(req.query["hub.verify_token"]===VERIFY_TOKEN) return res.send(req.query["hub.challenge"]);
  res.sendStatus(403);
});
app.post("/webhook", async (req,res)=>{
  try{
    const m = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if(!m) return res.sendStatus(200);
    const from = m.from;
    const text = m.text?.body || "Sannu";
    const model = genAI.getGenerativeModel({model:"gemini-1.5-flash"});
    const r = await model.generateContent(`Kai ne SAHRAB AI na Abubakar a Kano. Amsa a Hausa/Turanci: ${text}`);
    const reply = r.response.text();
    await axios.post(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`,{messaging_product:"whatsapp", to:from, text:{body:reply}},{headers:{Authorization:`Bearer ${TOKEN}`}});
    res.sendStatus(200);
  }catch(e){ res.sendStatus(200); }
});
app.listen(process.env.PORT||3000);
