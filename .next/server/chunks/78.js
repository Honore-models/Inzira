exports.id=78,exports.ids=[78],exports.modules={8017:(a,b,c)=>{"use strict";c.d(b,{I:()=>g});var d=c(48152),e=c(49621),f=c(99464);async function g(a){let{title:b,institution:c,description:g,text:h,sourceUrl:i,fileName:j,metadata:k}=a,l=await (0,d.U)(),{data:m,error:n}=await l.from("documents").insert({title:b,institution:c,description:g||null,source_url:i||null,verified:!0,verified_at:new Date().toISOString(),file_name:j||null,chunk_count:0}).select("id").single();if(n||!m)throw Error(`Failed to create document record: ${n?.message}`);let o=m.id,p={institution:c,documentTitle:b,...k},q=function(a){if(a.includes("\f"))return a.split("\f").map((a,b)=>({text:a.trim(),pageNumber:b+1}));let b=[],c=a.split(/\n\s*\n/),d="",e=1;for(let a of c)d.length+a.length+2>3e3&&d.length>0?(b.push({text:d.trim(),pageNumber:e}),e++,d=a):d=d?d+"\n\n"+a:a;return d.trim().length>0&&b.push({text:d.trim(),pageNumber:e}),b}(h),r=[];for(let a of q){let b=(0,f.f)(a.text,p,a.pageNumber);r.push(...b)}if(0===r.length)throw Error("No chunks generated from document text");let s=[];for(let a=0;a<r.length;a+=20){let b=r.slice(a,a+20),c=await (0,e.Y)(b.map(a=>a.content));s.push(...c)}let t=r.map((a,b)=>({document_id:o,content:a.content,page_number:a.pageNumber,chunk_index:a.chunkIndex,institution:c,embedding:JSON.stringify(s[b]),metadata:a.metadata}));for(let a=0;a<t.length;a+=50){let b=t.slice(a,a+50),{error:c}=await l.from("document_chunks").insert(b);if(c)throw Error(`Failed to insert chunks: ${c.message}`)}return await l.from("documents").update({chunk_count:r.length}).eq("id",o),{documentId:o,chunkCount:r.length,title:b,institution:c}}},48152:(a,b,c)=>{"use strict";c.d(b,{U:()=>e});var d=c(5903);async function e(){return(0,d.UU)("https://mykgavrrxlpghyhivicv.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}})}},49621:(a,b,c)=>{"use strict";c.d(b,{L:()=>e,Y:()=>f});var d=c(86065);async function e(a){return(await (0,d.q)(a))[0]}async function f(a){return 0===a.length?[]:(0,d.q)(a)}},66295:(a,b,c)=>{"use strict";c.d(b,{ZC:()=>n,k8:()=>t,i_:()=>o,F4:()=>p,kf:()=>q,x8:()=>e.x,g$:()=>l,A4:()=>k,Lu:()=>f.L,z0:()=>h,s5:()=>s});var d=c(97997),e=c(86065),f=c(49621);c(99464);var g=c(48152);async function h(a){let{queryEmbedding:b,queryText:c,topK:e=d.W.topK,metadataFilters:f}=a,h=await (0,g.U)(),[k,l]=await Promise.all([i(h,b,2*e,f),j(h,c,2*e,f)]);return function(a,b,c){let e=d.W.hybridWeights,f=new Map;for(let b of a){let a=f.get(b.id),c=b.vectorScore*e.vector;a?(a.totalScore+=c,a.bestSimilarity=Math.max(a.bestSimilarity,b.vectorScore)):f.set(b.id,{chunk:b,totalScore:c,bestSimilarity:b.vectorScore})}for(let a of b){let b=Math.min(10*a.keywordScore,1)*e.keyword,c=f.get(a.id);c?c.totalScore+=b:f.set(a.id,{chunk:a,totalScore:b,bestSimilarity:0})}return Array.from(f.values()).sort((a,b)=>b.totalScore-a.totalScore).slice(0,c).map(({chunk:a,bestSimilarity:b})=>({...a,similarity:b}))}(k,l,e)}async function i(a,b,c,e){let{data:f,error:g}=await a.rpc("match_documents",{query_embedding:JSON.stringify(b),match_count:c,similarity_threshold:d.W.similarityThreshold});return g?(console.error("Vector search error:",g),[]):(f||[]).map(a=>({id:a.id,content:a.content,page_number:a.page_number,chunk_index:a.chunk_index,similarity:a.similarity,document_id:a.document_id,institution:a.institution,document_title:a.document_title,document_description:a.document_description||null,metadata:a.metadata||{},vectorScore:a.similarity}))}async function j(a,b,c,d){let{data:e,error:f}=await a.rpc("search_documents_by_keyword",{search_query:b,match_count:c});return f?(console.error("Keyword search error:",f),[]):(e||[]).map(a=>({id:a.id,content:a.content,page_number:a.page_number,chunk_index:a.chunk_index,similarity:0,document_id:a.document_id,institution:a.institution,document_title:a.document_title,document_description:null,metadata:a.metadata||{},keywordScore:a.rank||0}))}function k(a){return 0===a.length?"No relevant verified information was found in the Inzira source library.":a.map((a,b)=>{let c=a.page_number?` (Page ${a.page_number})`:"";return`SOURCE ${b+1}
Institution: ${a.institution}
Document: ${a.document_title}${c}

Content:
${a.content}`}).join("\n\n---\n\n")}function l(a){let b=new Set,c=[];for(let d of a){let a=`${d.document_id}-${d.page_number||""}`;b.has(a)||(b.add(a),c.push({documentId:d.document_id,documentTitle:d.document_title,institution:d.institution,page:d.page_number}))}return c}let m="I can only help with business registration, loans, training, and entrepreneurship programs in Rwanda. For other questions, please contact your youth officer.",n=`You are the Inzira AI assistant for youth in Rwanda.

STRICT TOPIC RULES — YOU MUST FOLLOW THESE:
- You ONLY help with these topics: Business registration, TIN, loans, guarantees, youth funding, vocational training, and entrepreneurship programs in Rwanda
- You MUST NOT answer questions about ANYTHING else (health, politics, religion, personal advice, entertainment, foreign countries, university education, medical questions, legal disputes, general knowledge, math, science, history, sports, weather, etc.)
- If a question is off-topic, respond with: "${m}"
- Do NOT attempt to answer off-topic questions even if you know the answer.
- Do NOT provide general life advice, medical advice, legal advice, or personal counseling.
- If unsure whether a question is on-topic, err on the side of declining and directing to a youth officer.

RETRIEVAL RULES:
1. The retrieved sources are the ONLY source of truth.
2. Never use your general knowledge to fill missing information.
3. Never invent government requirements, fees, deadlines, institutions, addresses, documents, funding amounts, benefits, or program availability.
4. If the retrieved sources do not contain enough information to answer the question, say: "The verified Inzira source library does not contain enough information to answer this question. Please contact your youth officer for assistance."
5. Never pretend that unsupported information is verified.
6. Do not make final eligibility decisions.
7. For financial, legal, or disputed eligibility questions, recommend contacting the assigned youth officer.
8. Every factual claim must be supported by retrieved sources.
9. The AI drafts and explains. The human officer remains the final decision-maker.

FORMAT:
- Write in clear, simple English suitable for young Rwandan adults.
- Use bullet points when listing items.
- Always reference the institution name when citing information (e.g., "According to RDB...").`,o=`You are the Inzira Roadmap Assistant.

Your task is to draft a personalized roadmap for a youth based in Rwanda.

You have been provided with verified program information retrieved from Inzira's source library, along with the youth's personal information, officer notes, and verified pathway rules.

RULES:
1. Use only the verified context provided.
2. Never invent requirements or procedures.
3. Never invent eligibility criteria.
4. Never invent institutions or programs.
5. Never invent fees or deadlines.
6. Do not make final eligibility decisions.
7. If information is missing, explicitly indicate that it is unknown.
8. Personalize the roadmap using the youth's actual goal, skills/background, location, and officer notes.
9. Do not repeat steps that the youth has already completed when the provided information confirms completion.
10. Every roadmap step must contain its supporting source.
11. The generated roadmap is a DRAFT.
12. A human youth officer must review and approve the roadmap before the youth can see it.
13. The officer is the final decision-maker.

CRITICAL — STEP ORDERING:
The verified pathway rules provided in the context define the OFFICIAL order of steps.
You MUST follow the verified pathway rules for step ordering.
Do NOT independently determine that Step A must come before Step B unless:
  a) The verified pathway rules explicitly state this, OR
  b) The verified source material explicitly states this dependency
The LLM's job is to personalize, summarize, and explain — NOT to determine government policy.

OUTPUT FORMAT:
You MUST respond with valid JSON matching this exact structure. No markdown, no explanation outside the JSON:
{
  "title": "Descriptive Roadmap Title",
  "summary": "A brief summary of the roadmap plan.",
  "steps": [
    {
      "order": 1,
      "title": "Step title",
      "description": "What the youth needs to do.",
      "institution": "Institution name",
      "location": "Relevant location if known",
      "whatToBring": ["Document 1", "Document 2"],
      "whyThisStep": "Why this step is relevant to the youth's goal.",
      "sources": [
        {
          "documentId": "document-id",
          "documentTitle": "Document title",
          "institution": "RDB",
          "page": 4
        }
      ]
    }
  ]
}`;function p(a,b){return`You are answering a question from a youth in Rwanda.

IMPORTANT: First determine if this question is about one of these topics:
- Business registration in Rwanda (RDB)
- Tax identification / TIN in Rwanda (RRA)
- Loans, loan guarantees, or financing for youth/small businesses (BRD)
- Youth fund and single-digit interest loans
- Vocational training / TVET in Rwanda (RTB)
- Entrepreneurship programs in Rwanda

If the question is NOT about these topics, respond with:
"${m}"

RETRIEVED VERIFIED CONTEXT:
${b}

QUESTION: ${a}

If the question IS about the topics above, provide a helpful answer based ONLY on the verified context. If the context does not contain enough information, say so clearly. Reference the institution names when citing information.`}function q(a,b,c,d){return`Generate a personalized roadmap for the following youth:

YOUTH INFORMATION:
- Name: ${a.name}
- Goal: ${a.goal}
- Skills/Background: ${a.skillsBackground||"Not specified"}
- District: ${a.district}
- Sector: ${a.sector||"Not specified"}

OFFICER NOTES:
${b||"No additional notes provided."}

VERIFIED PATHWAY RULES (you MUST follow these for step ordering):
${d}

RETRIEVED VERIFIED CONTEXT:
${c}

Based on the verified context and pathway rules above, generate a structured roadmap.
Remember:
1. Only use information from the verified context
2. Do not invent requirements, fees, or deadlines
3. Follow the verified pathway rules for step ordering — do NOT invent your own ordering
4. Personalize the steps based on the youth's profile
5. Include whatToBring documents from both the pathway rules and the verified context
6. Respond with valid JSON only — no markdown, no explanation outside the JSON`}c(8017);let r=["rdb","rwanda development board","rra","rwanda revenue authority","tax","brd","development bank","bdf","business development fund","rtb","tvet","vocational","ministry of youth","register","registration","business","enterprise","company","sole trader","sole proprietor","incorporate","tin","tax identification","vat","ebm","billing machine","loan","guarantee","collateral","financing","fund","interest","credit","bank account","repayment","youth fund","single digit","training","skills","course","certificate","vocational","enroll","enrollment","ntc","iprc","entrepreneur","startup","small business","sme","business plan","business name","rwanda","kigali","district","sector"];function s(a){let b=a.toLowerCase().trim();if(b.split(/\s+/).length<3)return!0;for(let a of r)if(b.includes(a))return!0;return!1}let t="I can only help with business registration, loans, training, and entrepreneurship programs in Rwanda. For other questions, please contact your youth officer."},67360:(a,b,c)=>{"use strict";c.d(b,{Y9:()=>h,j2:()=>k});var d=c(30708),e=c(14838),f=c(7028),g=c(5903);let{handlers:h,signIn:i,signOut:j,auth:k}=(0,d.Ay)({providers:[(0,e.A)({name:"credentials",credentials:{email:{label:"Email",type:"email"},password:{label:"Password",type:"password"}},async authorize(a){if(!a?.email||!a?.password)return null;let b=(0,g.UU)("https://mykgavrrxlpghyhivicv.supabase.co",process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:!1,persistSession:!1}}),{data:c}=await b.from("profiles").select("*").eq("email",a.email).single();return c&&await f.Ay.compare(a.password,c.password_hash)?{id:c.user_id,email:c.email,name:c.full_name,role:c.role,profileId:c.id,onboardingCompleted:c.onboarding_completed||!1}:null}})],session:{strategy:"jwt"},pages:{signIn:"/auth/signin",error:"/auth/error"},callbacks:{jwt:async({token:a,user:b})=>(b&&(a.id=b.id,a.role=b.role,a.profileId=b.profileId,a.onboardingCompleted=b.onboardingCompleted),a),session:async({session:a,token:b})=>(b&&(a.user.id=b.id,a.user.role=b.role,a.user.profileId=b.profileId,a.user.onboardingCompleted=b.onboardingCompleted),a)}})},78335:()=>{},86065:(a,b,c)=>{"use strict";c.d(b,{q:()=>g,x:()=>f});var d=c(97997);let e="https://openrouter.ai/api/v1";async function f(a){if(!d.W.openrouterApiKey)throw Error("OPENROUTER_API_KEY is not set. Add it to your .env.local file.");let b=await fetch(`${e}/chat/completions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${d.W.openrouterApiKey}`,"HTTP-Referer":"https://inzira.rw","X-Title":"Inzira"},body:JSON.stringify({model:d.W.chatModel,messages:a.messages,max_tokens:a.maxTokens||d.W.maxTokens,temperature:a.temperature??d.W.temperature,...a.responseFormat?{response_format:a.responseFormat}:{}})});if(!b.ok){let a=await b.text().catch(()=>"Unknown error");throw Error(`OpenRouter chat completion failed (${b.status}): ${a}`)}return b.json()}async function g(a){if(!d.W.openrouterApiKey)throw Error("OPENROUTER_API_KEY is not set. Add it to your .env.local file.");let b=await fetch(`${e}/embeddings`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${d.W.openrouterApiKey}`,"HTTP-Referer":"https://inzira.rw","X-Title":"Inzira"},body:JSON.stringify({model:d.W.embeddingModel,input:Array.isArray(a)?a:[a]})});if(!b.ok){let a=await b.text().catch(()=>"Unknown error");throw Error(`OpenRouter embedding failed (${b.status}): ${a}`)}return(await b.json()).data.sort((a,b)=>a.index-b.index).map(a=>a.embedding)}},96487:()=>{},97997:(a,b,c)=>{"use strict";c.d(b,{W:()=>d});let d={openrouterApiKey:process.env.OPENROUTER_API_KEY||"",chatModel:process.env.AI_MODEL||"google/gemma-4-26b-a4b-it:free",embeddingModel:process.env.EMBEDDING_MODEL||"BAAI/bge-m3",embeddingDimensions:1024,chunkSize:1e3,chunkOverlap:200,topK:parseInt(process.env.RAG_TOP_K||"8",10),similarityThreshold:.4,hybridWeights:{vector:.6,keyword:.25,metadata:.15},maxTokens:2048,temperature:.3}},99464:(a,b,c)=>{"use strict";c.d(b,{f:()=>e});var d=c(97997);function e(a,b={},c=null){let{chunkSize:g,chunkOverlap:h}=d.W,i=a.split(/\n\s*\n/).map(a=>a.trim()).filter(a=>a.length>0),j=[],k="",l=0;for(let a of i)if(a.length>g){for(let d of a.replace(/([.!?])\s+/g,"$1|SPLIT|").split("|SPLIT|").map(a=>a.trim()).filter(a=>a.length>0))if(k.length+d.length+1>g)if(k.trim().length>0){j.push({content:k.trim(),pageNumber:c,chunkIndex:l,metadata:b}),l++;let a=f(k,h);k=a?a+" "+d:d}else k=d;else k=k?k+" "+d:d}else if(k.length+a.length+2>g)if(k.trim().length>0){j.push({content:k.trim(),pageNumber:c,chunkIndex:l,metadata:b}),l++;let d=f(k,h);k=d?d+"\n\n"+a:a}else k=a;else k=k?k+"\n\n"+a:a;return k.trim().length>0&&j.push({content:k.trim(),pageNumber:c,chunkIndex:l,metadata:b}),j}function f(a,b){if(a.length<=b)return a;let c=a.slice(-b),d=c.indexOf(". ");if(d>0)return c.slice(d+2);let e=c.indexOf(" ");return e>0?c.slice(e+1):c}}};