"use strict";(()=>{var a={};a.id=4449,a.ids=[4449],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{a.exports=require("crypto")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66295:(a,b,c)=>{c.d(b,{ZC:()=>n,k8:()=>t,i_:()=>o,F4:()=>p,kf:()=>q,x8:()=>e.x8,Ye:()=>e.Ye,g$:()=>l,A4:()=>k,Lu:()=>f.L,z0:()=>h,s5:()=>s});var d=c(97997),e=c(86065),f=c(49621);c(99464);var g=c(48152);async function h(a){let{queryEmbedding:b,queryText:c,topK:e=d.W.topK,metadataFilters:f}=a,h=await (0,g.U)(),[k,l]=await Promise.all([i(h,b,2*e,f),j(h,c,2*e,f)]);return function(a,b,c){let e=d.W.hybridWeights,f=new Map;for(let b of a){let a=f.get(b.id),c=b.vectorScore*e.vector;a?(a.totalScore+=c,a.bestSimilarity=Math.max(a.bestSimilarity,b.vectorScore)):f.set(b.id,{chunk:b,totalScore:c,bestSimilarity:b.vectorScore})}for(let a of b){let b=Math.min(10*a.keywordScore,1)*e.keyword,c=f.get(a.id);c?c.totalScore+=b:f.set(a.id,{chunk:a,totalScore:b,bestSimilarity:0})}return Array.from(f.values()).sort((a,b)=>b.totalScore-a.totalScore).slice(0,c).map(({chunk:a,bestSimilarity:b})=>({...a,similarity:b}))}(k,l,e)}async function i(a,b,c,e){let{data:f,error:g}=await a.rpc("match_documents",{query_embedding:JSON.stringify(b),match_count:c,similarity_threshold:d.W.similarityThreshold});return g?(console.error("Vector search error:",g),[]):(f||[]).map(a=>({id:a.id,content:a.content,page_number:a.page_number,chunk_index:a.chunk_index,similarity:a.similarity,document_id:a.document_id,institution:a.institution,document_title:a.document_title,document_description:a.document_description||null,metadata:a.metadata||{},vectorScore:a.similarity}))}async function j(a,b,c,d){let{data:e,error:f}=await a.rpc("search_documents_by_keyword",{search_query:b,match_count:c});return f?(console.error("Keyword search error:",f),[]):(e||[]).map(a=>({id:a.id,content:a.content,page_number:a.page_number,chunk_index:a.chunk_index,similarity:0,document_id:a.document_id,institution:a.institution,document_title:a.document_title,document_description:null,metadata:a.metadata||{},keywordScore:a.rank||0}))}function k(a){return 0===a.length?"No relevant verified information was found in the Inzira source library.":a.map((a,b)=>{let c=a.page_number?` (Page ${a.page_number})`:"";return`SOURCE ${b+1}
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
11. CRITICAL — MINIMUM STEPS:
You MUST generate at least 3 steps. 4-5 steps is preferred for a complete roadmap.
If the goal is simple (e.g. business registration), still break it into meaningful sub-steps (e.g. registration, TIN, bank account, funding).

The generated roadmap is a DRAFT.
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
6. Respond with valid JSON only — no markdown, no explanation outside the JSON`}c(8017);let r=["rdb","rwanda development board","rra","rwanda revenue authority","tax","brd","development bank","bdf","business development fund","rtb","tvet","vocational","ministry of youth","register","registration","business","enterprise","company","sole trader","sole proprietor","incorporate","tin","tax identification","vat","ebm","billing machine","loan","guarantee","collateral","financing","fund","interest","credit","bank account","repayment","youth fund","single digit","training","skills","course","certificate","vocational","enroll","enrollment","ntc","iprc","entrepreneur","startup","small business","sme","business plan","business name","rwanda","kigali","district","sector"];function s(a){let b=a.toLowerCase().trim();if(b.split(/\s+/).length<3)return!0;for(let a of r)if(b.includes(a))return!0;return!1}let t="I can only help with business registration, loans, training, and entrepreneurship programs in Rwanda. For other questions, please contact your youth officer."},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")},89721:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>F,patchFetch:()=>E,routeModule:()=>A,serverHooks:()=>D,workAsyncStorage:()=>B,workUnitAsyncStorage:()=>C});var d={};c.r(d),c.d(d,{POST:()=>z});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(2404),w=c(48152),x=c(66295);let y=[{id:"business-registration",name:"Business Registration & Funding",steps:[{order:1,institution:"RDB",title:"Register business with RDB",description:"Register your business (Enterprise or Domestic Company) with the Rwanda Development Board. Registration is free. Processing typically takes a few hours.",requiredDocuments:["National ID or passport","Three business name options (for Enterprise)","Physical address","Phone number or email","Activity description"],notes:"Enterprise registration is for businesses with turnover under RWF 10,000/day. Your TIN is issued automatically with your registration certificate."},{order:2,institution:"RRA",title:"Obtain Tax Identification Number (TIN)",requiredBefore:["business-registration-rdb"],description:"Your TIN is issued automatically when you register through RDB — no separate application needed for most small businesses.",requiredDocuments:["National ID","Business registration certificate"],notes:"TIN registration is free. Only businesses with turnover over RWF 20 million/year need separate VAT registration."},{order:3,institution:"Bank",title:"Open business bank account",requiredBefore:["business-registration-rra"],description:"Open a business bank account in the name of your registered business.",requiredDocuments:["National ID","Business registration certificate","TIN certificate"],notes:"Visit any commercial bank. Some banks offer youth-friendly accounts."},{order:4,institution:"BRD",title:"Apply for BRD loan guarantee",requiredBefore:["business-registration-bank"],description:"Apply for a loan guarantee from the Development Bank of Rwanda (formerly BDF) to access affordable financing.",requiredDocuments:["National ID","Business registration certificate","TIN","Business plan","Bank statements","Quotations for equipment/supplies","District endorsement letter"],notes:"BRD covers up to 50% collateral for general SMEs, and up to 75% for youth and women-owned businesses. Processing takes 2-4 weeks."},{order:5,institution:"Various",title:"Build business plan",description:"Develop or refine a business plan to guide your operations and strengthen funding applications.",requiredDocuments:[],notes:"BRD and other institutions offer free business advisory services."}]},{id:"youth-funding",name:"Youth Fund Single-Digit Interest Loans",steps:[{order:1,institution:"RDB",title:"Register business with RDB",description:"Register your business with the Rwanda Development Board. Your TIN is issued automatically.",requiredDocuments:["National ID or passport"],notes:"Registration is free and takes a few hours."},{order:2,institution:"Bank",title:"Open business bank account",requiredBefore:["youth-funding-rdb"],description:"Open a business bank account for your registered business.",requiredDocuments:["National ID","Business registration certificate","TIN"]},{order:3,institution:"BRD",title:"Apply for Youth Fund loan",requiredBefore:["youth-funding-bank"],description:"Apply for the Youth Fund loan at 9% interest with 90% collateral guarantee. Loan amounts capped at RWF 10 million.",requiredDocuments:["National ID","Business registration certificate","Repayment plan","Evidence of working with business support institutions"],notes:"You only need to provide 10% collateral. Successful repayment earns a 10% grant bonus. Repayment begins 3 months after disbursement."}]},{id:"vocational-training",name:"Vocational Training Enrollment",steps:[{order:1,institution:"RTB",title:"Choose a TVET program",description:"Research and select a vocational training program. RTB offers TVET from level 1 to level 5 through VTCs, TSSs, and IPRCs.",requiredDocuments:[],notes:"Visit your nearest TVET center or check available programs at rtb.gov.rw."},{order:2,institution:"RTB",title:"Check eligibility and gather documents",description:"Confirm you meet the program requirements and collect all necessary documents.",requiredDocuments:["National ID","School certificate (if required)"]},{order:3,institution:"RTB",title:"Enroll in the program",description:"Submit your application and complete enrollment at the chosen TVET center.",requiredDocuments:["National ID","Application form","School certificate"]},{order:4,institution:"RTB",title:"Complete training and certification",description:"Attend classes, complete coursework, and receive your TVET certificate. 84% of graduates find jobs within 9 months.",requiredDocuments:[],notes:"Duration varies by program (3 months to 2 years). RTB also offers short 6-12 month courses for NEET youth."}]}];async function z(a){try{let b,c,d,e,f,g=await (0,v.j2)();if(!g?.user)return u.NextResponse.json({error:"Unauthorized"},{status:401});if("officer"!==g.user.role)return u.NextResponse.json({error:"Only officers can generate roadmaps"},{status:403});let h=await a.json();if(!h.youth||"object"!=typeof h.youth)return u.NextResponse.json({error:"Youth information is required"},{status:400});let{youth:i,officerNotes:j,caseId:k,youthProfileId:l}=h;if(!i.name||!i.goal)return u.NextResponse.json({error:"Youth name and goal are required"},{status:400});let m=function(a){let b=a.toLowerCase();return b.includes("business")||b.includes("register")||b.includes("start")||b.includes("entrepreneur")?"business-registration":b.includes("training")||b.includes("vocational")||b.includes("tvet")||b.includes("skills")||b.includes("learn")?"vocational-training":null}(i.goal),n=m?y.find(a=>a.id===m):null,o=[i.goal,i.skillsBackground,i.district,i.sector,j].filter(Boolean).join(" ");try{b=await (0,x.Lu)(o)}catch(a){return console.error("Embedding generation failed:",a),u.NextResponse.json({error:"Failed to process the request. Please try again."},{status:500})}try{c=await (0,x.z0)({queryEmbedding:b,queryText:o,metadataFilters:n?{institution:void 0}:void 0})}catch(a){return console.error("Hybrid retrieval failed:",a),u.NextResponse.json({error:"Failed to search verified sources. Please try again."},{status:500})}let p=(0,x.A4)(c),q=n?n.steps.map(a=>`Step ${a.order}: ${a.title} (${a.institution})
Description: ${a.description}
Required documents: ${a.requiredDocuments.join(", ")||"None specified"}
`+(a.notes?`Notes: ${a.notes}
`:"")).join("\n"):"No specific pathway rules found for this goal. Use only the verified context above for ordering.",r=(0,x.kf)(i,j||"",p,q);try{let a=await (0,x.x8)({messages:[{role:"system",content:x.i_},{role:"user",content:r}],responseFormat:{type:"json_object"}});d=a.choices[0]?.message?.content||""}catch(c){console.error("Roadmap generation failed:",c);let a=c instanceof Error?c.message:"",b=a.includes("429")||a.includes("rate")||a.includes("Rate limit");return u.NextResponse.json({error:b?"The AI service is temporarily busy. Please wait a moment and try again.":"Failed to generate roadmap. Please try again."},{status:b?429:500})}if(!d)return u.NextResponse.json({error:"Failed to generate roadmap. Please try again."},{status:500});try{e=JSON.parse((0,x.Ye)(d))}catch{return console.error("Invalid JSON from NVIDIA chat model:",d),u.NextResponse.json({error:"The AI returned an invalid response. Please try again."},{status:500})}try{f=function(a){if(!a||"object"!=typeof a)throw Error("Invalid roadmap: not an object");if("string"!=typeof a.title||0===a.title.length)throw Error("Invalid roadmap: missing or empty title");if("string"!=typeof a.summary||0===a.summary.length)throw Error("Invalid roadmap: missing or empty summary");if(!Array.isArray(a.steps)||a.steps.length<3)throw Error("Invalid roadmap: must have at least 3 steps");let b=a.steps.map((a,b)=>{if(!a||"object"!=typeof a)throw Error(`Invalid step at index ${b}`);return{order:"number"==typeof a.order?a.order:b+1,title:"string"==typeof a.title?a.title:`Step ${b+1}`,description:"string"==typeof a.description?a.description:"",institution:"string"==typeof a.institution?a.institution:"",location:"string"==typeof a.location?a.location:null,whatToBring:Array.isArray(a.whatToBring)?a.whatToBring:[],whyThisStep:"string"==typeof a.whyThisStep?a.whyThisStep:"",sources:Array.isArray(a.sources)?a.sources:[]}});return{title:a.title,summary:a.summary,steps:b}}(e)}catch(a){return console.error("Roadmap validation failed:",a),u.NextResponse.json({error:"The AI response did not match the expected format. Please try again."},{status:500})}let s=await (0,w.U)(),t=k;if(!t&&l){let{data:a}=await s.from("youth_cases").select("id").eq("youth_profile_id",l).in("status",["pending","active"]).order("created_at",{ascending:!1}).limit(1).single();if(a)t=a.id;else{let a=await s.from("profiles").select("id").eq("user_id",g.user.id).single(),{data:b}=await s.from("youth_cases").insert({youth_profile_id:l,officer_profile_id:a?.data?.id||null,status:"pending",current_step:0,total_steps:0}).select().single();t=b?.id}}let z=null;if(t){let{data:a,error:b}=await s.from("ai_roadmaps").insert({case_id:t,title:f.title,summary:f.summary,steps_data:f.steps,sources:f.steps.flatMap(a=>a.sources||[]),officer_notes:j||null,status:"draft",youth_profile_id:l||null}).select().single();b?console.error("Failed to save roadmap:",b):a&&(z=a.id)}return u.NextResponse.json({...f,roadmapId:z})}catch(a){return console.error("Generate roadmap endpoint error:",a),u.NextResponse.json({error:"An unexpected error occurred. Please try again."},{status:500})}}let A=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/ai/generate-roadmap/route",pathname:"/api/ai/generate-roadmap",filename:"route",bundlePath:"app/api/ai/generate-roadmap/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/honore/Users/HP/Desktop/Inzira/src/app/api/ai/generate-roadmap/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:B,workUnitAsyncStorage:C,serverHooks:D}=A;function E(){return(0,g.patchFetch)({workAsyncStorage:B,workUnitAsyncStorage:C})}async function F(a,b,c){var d;let e="/api/ai/generate-roadmap/route";"/index"===e&&(e="/");let g=await A.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||A.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===A.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>A.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>A.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await A.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},z),b}},l=await A.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await A.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[1331,1308,7028,421,8728],()=>b(b.s=89721));module.exports=c})();