"use strict";(()=>{var a={};a.id=5482,a.ids=[5482],a.modules={261:a=>{a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},22582:(a,b,c)=>{c.r(b),c.d(b,{handler:()=>D,patchFetch:()=>C,routeModule:()=>y,serverHooks:()=>B,workAsyncStorage:()=>z,workUnitAsyncStorage:()=>A});var d={};c.r(d),c.d(d,{POST:()=>x});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(2404),w=c(66295);async function x(a){try{let b,c,d,e=await (0,v.j2)();if(!e?.user)return u.NextResponse.json({error:"Unauthorized"},{status:401});let f=await a.json();if(!f.question||"string"!=typeof f.question)return u.NextResponse.json({error:"A valid question is required"},{status:400});let g=f.question.trim();if(g.length<3)return u.NextResponse.json({error:"Question is too short"},{status:400});if(g.length>2e3)return u.NextResponse.json({error:"Question is too long (max 2000 characters)"},{status:400});if(!(0,w.s5)(g)){let a={answer:w.k8,sources:[]};return u.NextResponse.json(a)}try{b=await (0,w.Lu)(g)}catch(a){return console.error("Embedding generation failed:",a),u.NextResponse.json({error:"Failed to process your question. Please try again."},{status:500})}try{c=await (0,w.z0)({queryEmbedding:b,queryText:g})}catch(a){return console.error("Hybrid retrieval failed:",a),u.NextResponse.json({error:"Failed to search the knowledge base. Please try again."},{status:500})}if(0===c.length)return u.NextResponse.json({answer:"I couldn't find enough verified information in the Inzira source library to answer this question. Please try rephrasing your question, or ask your youth officer for assistance with this specific topic.",sources:[]});let h=(0,w.A4)(c),i=(0,w.F4)(g,h);try{let a=await (0,w.x8)({messages:[{role:"system",content:w.ZC},{role:"user",content:i}]});d=a.choices[0]?.message?.content||""}catch(c){console.error("Chat completion failed:",c);let a=c instanceof Error?c.message:"",b=a.includes("429")||a.includes("rate")||a.includes("Rate limit");return u.NextResponse.json({error:b?"The AI service is temporarily busy. Please wait a moment and try again.":"Failed to generate an answer. Please try again."},{status:b?429:500})}if(!d)return u.NextResponse.json({error:"Failed to generate an answer. Please try again."},{status:500});let j=(0,w.g$)(c),k={answer:d.trim(),sources:j};return u.NextResponse.json(k)}catch(a){return console.error("AI Ask endpoint error:",a),u.NextResponse.json({error:"An unexpected error occurred. Please try again."},{status:500})}}let y=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/ai/ask/route",pathname:"/api/ai/ask",filename:"route",bundlePath:"app/api/ai/ask/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/home/honore/Users/HP/Desktop/Inzira/src/app/api/ai/ask/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:z,workUnitAsyncStorage:A,serverHooks:B}=y;function C(){return(0,g.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:A})}async function D(a,b,c){var d;let e="/api/ai/ask/route";"/index"===e&&(e="/");let g=await y.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!x){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||y.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===y.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>y.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>y.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await y.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await y.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await y.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},29294:a=>{a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:a=>{a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{a.exports=require("crypto")},63033:a=>{a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66295:(a,b,c)=>{c.d(b,{ZC:()=>n,k8:()=>t,i_:()=>o,F4:()=>p,kf:()=>q,x8:()=>e.x8,Ye:()=>e.Ye,g$:()=>l,A4:()=>k,Lu:()=>f.L,z0:()=>h,s5:()=>s});var d=c(97997),e=c(86065),f=c(49621);c(99464);var g=c(48152);async function h(a){let{queryEmbedding:b,queryText:c,topK:e=d.W.topK,metadataFilters:f}=a,h=await (0,g.U)(),[k,l]=await Promise.all([i(h,b,2*e,f),j(h,c,2*e,f)]);return function(a,b,c){let e=d.W.hybridWeights,f=new Map;for(let b of a){let a=f.get(b.id),c=b.vectorScore*e.vector;a?(a.totalScore+=c,a.bestSimilarity=Math.max(a.bestSimilarity,b.vectorScore)):f.set(b.id,{chunk:b,totalScore:c,bestSimilarity:b.vectorScore})}for(let a of b){let b=Math.min(10*a.keywordScore,1)*e.keyword,c=f.get(a.id);c?c.totalScore+=b:f.set(a.id,{chunk:a,totalScore:b,bestSimilarity:0})}return Array.from(f.values()).sort((a,b)=>b.totalScore-a.totalScore).slice(0,c).map(({chunk:a,bestSimilarity:b})=>({...a,similarity:b}))}(k,l,e)}async function i(a,b,c,e){let{data:f,error:g}=await a.rpc("match_documents",{query_embedding:JSON.stringify(b),match_count:c,similarity_threshold:d.W.similarityThreshold});return g?(console.error("Vector search error:",g),[]):(f||[]).map(a=>({id:a.id,content:a.content,page_number:a.page_number,chunk_index:a.chunk_index,similarity:a.similarity,document_id:a.document_id,institution:a.institution,document_title:a.document_title,document_description:a.document_description||null,metadata:a.metadata||{},vectorScore:a.similarity}))}async function j(a,b,c,d){let{data:e,error:f}=await a.rpc("search_documents_by_keyword",{search_query:b,match_count:c});return f?(console.error("Keyword search error:",f),[]):(e||[]).map(a=>({id:a.id,content:a.content,page_number:a.page_number,chunk_index:a.chunk_index,similarity:0,document_id:a.document_id,institution:a.institution,document_title:a.document_title,document_description:null,metadata:a.metadata||{},keywordScore:a.rank||0}))}function k(a){return 0===a.length?"No relevant verified information was found in the Inzira source library.":a.map((a,b)=>{let c=a.page_number?` (Page ${a.page_number})`:"";return`SOURCE ${b+1}
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
6. Respond with valid JSON only — no markdown, no explanation outside the JSON`}c(8017);let r=["rdb","rwanda development board","rra","rwanda revenue authority","tax","brd","development bank","bdf","business development fund","rtb","tvet","vocational","ministry of youth","register","registration","business","enterprise","company","sole trader","sole proprietor","incorporate","tin","tax identification","vat","ebm","billing machine","loan","guarantee","collateral","financing","fund","interest","credit","bank account","repayment","youth fund","single digit","training","skills","course","certificate","vocational","enroll","enrollment","ntc","iprc","entrepreneur","startup","small business","sme","business plan","business name","rwanda","kigali","district","sector"];function s(a){let b=a.toLowerCase().trim();if(b.split(/\s+/).length<3)return!0;for(let a of r)if(b.includes(a))return!0;return!1}let t="I can only help with business registration, loans, training, and entrepreneurship programs in Rwanda. For other questions, please contact your youth officer."},86439:a=>{a.exports=require("next/dist/shared/lib/no-fallback-error.external")}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[1331,1692,5903,7028,421,8728],()=>b(b.s=22582));module.exports=c})();