export default async function handler(req:any,res:any){
  res.setHeader('Content-Type','application/json');
  if(req.method!== 'POST'){res.status(405).json({error:'Method not allowed'});return}
  const key=process.env.OPENROUTER_API_KEY;
  if(!key){res.status(503).json({error:'AI Assistant is currently unavailable. Please configure the OpenRouter API key in Vercel Environment Variables.'});return}
  const messages=req.body?.messages;
  if(!Array.isArray(messages)||messages.length>30||JSON.stringify(messages).length>12000){res.status(400).json({error:'Invalid or oversized message payload'});return}
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
  try{const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','HTTP-Referer':'https://medicore.app','X-Title':'MediCore Hospital Assistant'},body:JSON.stringify({model:process.env.OPENROUTER_MODEL||'openai/gpt-4o-mini',messages:[{role:'system',content:'You are MediCore Hospital Assistant. Help with hospital navigation, doctors, departments and appointment booking. Give general health education only. Never diagnose or prescribe. Recommend contacting a medical professional and emergency services for urgent symptoms.'},...messages.slice(-10)]}),signal:controller.signal});clearTimeout(timer);const data=await r.json();if(!r.ok)throw new Error(data.error?.message||'OpenRouter request failed');res.status(200).json({reply:data.choices?.[0]?.message?.content||'No response was generated.'})}catch(e:any){clearTimeout(timer);res.status(504).json({error:e.name==='AbortError'?'AI request timed out. Please try again.':'Unable to reach the AI Assistant. Please try again later.'})}
}
