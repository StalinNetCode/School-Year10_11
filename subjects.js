/* ---------- Extra engine. Loaded by index.html after the main script. Same behaviour as the Year 8 & 9 portal.
   Adds three question kinds that any subject file can use, plus the marking for them:
     N(question, number, unit, method, working)          a number answer (units typed by the student are ignored)
     M(question, [correct, wrong, wrong, wrong], method)  multiple choice (options are shuffled; tap one or type its letter)
     T(question, [key ideas], modelAnswer, method, {need, no})  fill-in-the-blank or free text, marked on key ideas, not exact wording.
        Each key idea is a list of accepted word-stems separated by | (e.g. 'vibrat' matches vibrate, vibrates, vibration).
        need = how many of the key ideas are required (default: all). no = stems that make the answer wrong (e.g. 'decreas').
     one(a, b, c)  picks one of several question templates, so a test rarely repeats a question.
     L(question, text)  turns any question into a listening question: a Listen button reads the text aloud in the subject's language.
   Typed answers are compared without accents, so "espanol" matches "español".
   A "Previous question" button is added to every test (all subjects) so a student can look back at earlier questions.
   Each question allows one attempt: Check Answer is final and shows the answer and steps if it was wrong. Explain unlocks afterwards and adds the reasoning.
   The dashboard gains a Redeem Puppies section: total earned, balance and redeemed are shown, with links to share a redemption.
   Topic files: list them in LOAD at the bottom of this file. Each topic is a separate file in a folder named after its subject
   (for example physics/forces.js), and adds its questions with BANK['Physics']['Area: Topic']=[[easy],[moderate],[difficult],[very difficult]]. ---------- */
const N=(q,a,u,m,w)=>({q,a,d:`${f(a)}${u?' '+u:''}`,m,w,k:'nm'});
const M=(q,o,m)=>{const c=o[0],opts=shuf(o.slice()),ci=opts.indexOf(c),L='ABCD'[ci];return{q,a:`${L}) ${c}`,d:`${L}) ${c}`,m,w:`The correct option is ${L}: ${c}.`,k:'mc',opts,ci}};
const T=(q,kw,a,m,o)=>({q,a,d:a,m,w:`Your wording can be different. It is marked on the key idea${kw.length>1?'s':''}, not the exact words.`,k:'tx',kw,...o});
const one=(...t)=>()=>pick(t)();
const plain=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const L=(x,say)=>({...x,say});
const nrm=s=>' '+plain(s).replace(/−/g,'-').replace(/[^a-z0-9.\-\/ ]+/g,' ').replace(/\.(?= |$)/g,' ').replace(/\s+/g,' ').trim()+' ';
function mark(q,v){
if(q.k=='nm'){const g=String(v).replace(/−/g,'-').replace(/,/g,'').match(/-?\d*\.?\d+/),x=g?+g[0]:NaN,ok=Math.abs(x-q.a)<=Math.max(.005,Math.abs(q.a)*.005)+1e-9;return{ok,soft:isNaN(x),fb:'Type a number for this answer, then press Check Answer.'}}
if(q.k=='mc'){const t=nrm(v).trim();let i=t.length==1?'abcd'.indexOf(t):-1;if(i<0)i=q.opts.findIndex(o=>o.trim()==String(v).trim());if(i<0)i=q.opts.findIndex(o=>nrm(o).trim()==t);return{ok:i==q.ci,soft:i<0,fb:'Choose one of the options: tap it, or type its letter. Then press Check Answer.'}}
const t=nrm(v),need=q.need||q.kw.length,hit=q.kw.filter(g=>g.split('|').some(s=>t.includes(s))).length,no=(q.no||[]).some(s=>t.includes(s));
return{ok:hit>=need&&!no}}
function mcUI(){const i=$('#ans'),q=S.t.qs[S.t.i],v=i?i.value.trim().toUpperCase():'';document.querySelectorAll('.mc').forEach((b,n)=>{b.classList.toggle('on',b.dataset.v==v);b.classList.toggle('right',q.done&&n==q.ci)})}
function sxMount(){if(S.v!='test'||!S.t)return;const q=S.t.qs[S.t.i],i=$('#ans');if(!q.k||!i)return;
const tip={mc:'Tap an option, or type its letter, then press Check Answer.',tx:'Answer in your own words: a word, a phrase or a short sentence. Spell the key words carefully.',nm:'Type a number. You can include the unit if you like.'}[q.k],h=i.nextElementSibling;
if(h&&h.tagName=='P'&&h.classList.contains('mu'))h.textContent=tip;else i.insertAdjacentHTML('afterend',`<p class=mu>${tip}</p>`);
if(q.k=='tx')i.placeholder='Type your answer in your own words';
if(q.k=='mc'){const p=$('#app p.q');if(p)p.insertAdjacentHTML('afterend',`<div class=mcs>${q.opts.map((o,n)=>`<button class="chip mc" data-a=mc data-v=${'ABCD'[n]} ${q.done?'disabled':''}><b>${'ABCD'[n]}</b> ${o}</button>`).join('')}</div>`);i.placeholder='Type A, B, C or D';i.oninput=mcUI;mcUI()}
if(q.say){const p=$('#app p.q');if(p)p.insertAdjacentHTML('afterend',`<p><button class=g data-a=say>🔊 Listen</button><button class=g data-a=saytx>Cannot hear it? Show the text</button></p><p class=mu id=saytx hidden>${q.say}</p>`)}}
document.head.insertAdjacentHTML('beforeend','<style>.mcs{display:grid;gap:8px;margin:10px 0}.mc{width:100%;font-weight:400}.mc b{margin-right:8px}.mc.right{border-color:var(--ok);box-shadow:0 0 0 2px var(--ok);opacity:1}</style>');
function bkMount(){if(S.v!='test'||!S.t||S.t.i<1)return;const i=$('#ans'),c=i&&i.closest('.card');if(!c)return;const n=c.querySelector('[data-a=next]'),b='<button class=g data-a=back>← Previous question</button>';if(n)n.insertAdjacentHTML('beforebegin',b);else c.insertAdjacentHTML('beforeend',b)}
/* ---------- Redeem Puppies (dashboard). Redemptions are stored in the database by portal_redeem; the total earned never goes down. ---------- */
let RD={k:'',r:0,l:[],t:0,sh:null};
const rdCall=async(a,nt)=>{const n=S.name,x=await fetch(SB+'/rest/v1/rpc/portal_redeem',{method:'POST',headers:{'Content-Type':'application/json',apikey:SK,Authorization:'Bearer '+SK},body:JSON.stringify({p_name:n,p_pin:S.pin,p_amount:a||0,p_note:nt||null})});if(!x.ok||n!==S.name)throw new Error('rd');return x.json()};
const rdTake=j=>{RD.k=S.name;RD.r=j.redeemed||0;RD.l=j.list||[];RD.t=Date.now()};
const pups=n=>`${n} ${n==1?'Puppy':'Puppies'}`;
const rdTot=()=>mine().reduce((s,t)=>s+(t.puppies||0),0);
const rdMsg=x=>`🐶 ${S.name} has redeemed ${pups(x.amount)} on the GCSE Practice Portal${x.note?` for: ${x.note}`:''}.\nDate: ${new Date(x.date).toLocaleDateString('en-GB')}\nReference: R-${x.id}`;
function rdMount(){if(S.v!='dash'||!S.ok)return;const big=$('#app .stats .big'),st=$('#app .stats');if(!big||!st)return;if(RD.k!=S.name)RD={k:S.name,r:0,l:[],t:0,sh:null};
const P=rdTot(),R=RD.r,B=Math.max(0,P-R),x=RD.sh,m=x?encodeURIComponent(rdMsg(x)):'';
big.innerHTML=`<span>🐶 Total Puppies earned</span><b>${P}</b><div class=rdb title="Balance ${B}, redeemed ${R}"><i style="width:${P?B/P*100:0}%"></i></div><p class=rdl><span>Balance: <b>${B}</b></span><span class=rdr>Redeemed: ${R}</span></p>`;
st.insertAdjacentHTML('afterend',`<div class=card><h2>Redeem Puppies</h2><p>You have <b>${pups(B)}</b> to redeem.${R?` <span class=mu>(${pups(R)} already redeemed out of ${P} earned.)</span>`:''}</p><button data-a=redeem ${B?'':'disabled'}>🎁 Redeem Puppies</button><p class=err id=rde></p>
${x?`<div class=pn><h3>Redeemed: ${pups(x.amount)}</h3><p>Share this with a parent or teacher so they know:</p><p><a class=rdk href="https://wa.me/?text=${m}" target=_blank rel=noopener>WhatsApp</a><a class=rdk href="mailto:?subject=${encodeURIComponent(`${S.name} has redeemed ${pups(x.amount)}`)}&body=${m}">Email</a>${navigator.share?'<button class=g data-a=rdshare>Share another way</button>':''}<button class=g data-a=rdcopy>Copy message</button></p><p class=mu>${esc(rdMsg(x)).replace(/\n/g,'<br>')}</p></div>`:''}
${RD.l.length?`<h3>Redeemed so far</h3><div class=wrap><table><tr><th>Date<th>Puppies<th>For<th>Reference<th></tr>${RD.l.map((r,i)=>`<tr class=rdr><td>${new Date(r.date).toLocaleDateString('en-GB')}<td>${r.amount} 🐶<td>${esc(r.note||'')}<td>R-${r.id}<td><button class=g data-a=rdpick data-v=${i}>Share</button></tr>`).join('')}</table></div>`:''}</div>`);
if(Date.now()-RD.t>15000){RD.t=Date.now();rdCall().then(j=>{if(j.status=='ok'){const b=RD.r+'|'+RD.l.length;rdTake(j);if(S.v=='dash'&&b!=RD.r+'|'+RD.l.length)render()}}).catch(()=>{})}}
document.head.insertAdjacentHTML('beforeend','<style>.rdb{height:10px;border-radius:5px;background:rgba(0,0,0,.2);margin:6px 0;overflow:hidden}.rdb i{display:block;height:100%;background:#12703a}.rdl{display:flex;gap:6px 14px;flex-wrap:wrap;margin:0;font-size:.95rem}.stats .rdl b{display:inline;font-size:1.15rem}.big .rdr{opacity:.6}tr.rdr td{color:var(--mu)}.rdk{display:inline-block;padding:9px 15px;border-radius:10px;background:var(--pr);color:var(--on);font-weight:700;text-decoration:none;margin:6px 6px 0 0}</style>');
/* ---------- One attempt per question. Check Answer is final: a correct answer earns Puppies; a wrong (or empty) answer locks the question and shows the
   Correction panel (answer and steps). There is no separate Correction button. Explain gives no hints: it is greyed out until the question is finished,
   and then adds the reasoning behind the steps.
   EXPL holds an explanation for each step of each calculation question type; it is filled by an explain.js file in a subject's folder. ---------- */
const EXPL={},xk=m=>{let x=5381;for(const c of String(m).replace(/[\d.]+/g,'#'))x=(x*33^c.charCodeAt(0))>>>0;return x.toString(36)};
const exOpen=q=>!!(q&&(q.done||q.showCor));
const fin=q=>{q.ok=false;q.done=true;q.showCor=true;q.fb=q.last?'Not correct. Your answer is final. The correct answer and the steps are shown below.':'No answer given. The correct answer and the steps are shown below.';render()};
function exMount(){if(S.v!='test'||!S.t)return;const q=S.t.qs[S.t.i],b=$('#app [data-a=exp]'),c=$('#app [data-a=cor]'),k=$('#app [data-a=chk]');if(c)c.remove();if(b){b.disabled=!exOpen(q);b.title=exOpen(q)?'':'Explain is available after you check your answer'}
if(k&&!q.done&&k.parentElement)k.parentElement.insertAdjacentHTML('afterend','<p class=mu>You have one attempt. Your answer is final when you press Check Answer, so check it carefully first.</p>');
const st=w=>{const p=String(w||'').split(/;\s+/).filter(Boolean);return p.length>1?`<ol>${p.map(x=>`<li>${x}</li>`).join('')}</ol>`:`<p>${p[0]||''}</p>`};
document.querySelectorAll('#app .pn').forEach(pn=>{const h=pn.querySelector('h3');if(!h)return;
if(h.textContent=='Correction')pn.querySelectorAll('p').forEach(p=>{const t=p.querySelector('b');if(!t)return;if(t.textContent=='Method:')p.remove();else if(t.textContent=='Working:')p.outerHTML=`<p><b>Steps:</b></p>${st(q.w)}`});
if(h.textContent=='Correction'){const n=[...pn.querySelectorAll('p.mu')].find(p=>/using Correction/.test(p.textContent));if(n)n.textContent='No Puppies are awarded for this question.'}
else if(h.textContent=='Explain'){const p=String(q.w||'').split(/;\s+/).filter(Boolean),x=q.k=='nm'&&EXPL[xk(q.m)];pn.innerHTML=`<h3>Explain</h3><p><b>The idea behind it:</b> ${q.m}</p><p><b>How the steps work:</b></p>${x&&x.length==p.length?`<ol>${p.map((s,i)=>`<li><b>${s}</b><br>${x[i]}</li>`).join('')}</ol>`:st(q.w)}<p><b>So the answer is:</b> ${esc(ans(q))}</p>`}})}
document.head.insertAdjacentHTML('beforeend','<style>button[data-a=exp]:disabled{opacity:.4;cursor:not-allowed}.pn ol{margin:.3em 0 .6em;padding-left:1.4em}.pn li{margin:.25em 0}</style>');
const render1=render;render=function(){if(S.v=='test'&&S.t){const q=S.t.qs[S.t.i];if(q&&!exOpen(q))q.showEx=false}render1();sxMount();bkMount();rdMount();exMount()};
const chk0=A.chk,exp0=A.exp;
Object.assign(A,{
exp(){if(exOpen(S.t&&S.t.qs[S.t.i]))exp0()},
back(){if(!S.t||S.t.i<1)return;cap();S.t.i--;render()},
async redeem(){if(S.busy)return;const B=Math.max(0,rdTot()-RD.r),E=m=>{const e=$('#rde');if(e)e.textContent=m};if(!B)return;
const a=prompt(`You have ${pups(B)} to redeem.\n\nHow many Puppies would you like to redeem?`);if(a===null)return;const n=+a.trim();if(!/^\d+$/.test(a.trim())||n<1||n>B)return E(`Enter a whole number from 1 to ${B}.`);
const nt=prompt(`Press OK to redeem ${pups(n)}, or Cancel to stop. This cannot be undone.\n\nYou can also type what you are redeeming them for:`);if(nt===null)return;S.busy=1;E('Redeeming…');
try{if(pend().length){const s=await sync(pend());if(s.status=='ok')take(s)}const j=await rdCall(n,nt.trim());S.busy=0;if(j.status=='ok'){rdTake(j);RD.sh=RD.l.find(r=>r.id==j.new_id)||RD.l[0];render()}else E(j.status=='too_many'?`You can redeem up to ${j.earned-j.redeemed} right now. Try again.`:'Could not redeem. Sign out, sign in again and try once more.')}catch(e){S.busy=0;E('Could not reach the server. Check the internet connection and try again.')}},
rdpick(v){RD.sh=RD.l[+v];render()},
rdshare(){try{navigator.share({text:rdMsg(RD.sh)}).catch(()=>{})}catch(e){}},
rdcopy(){const t=rdMsg(RD.sh),E=m=>{const e=$('#rde');if(e)e.textContent=m};try{navigator.clipboard.writeText(t).then(()=>E('Message copied.'),()=>prompt('Copy this message:',t))}catch(e){prompt('Copy this message:',t)}},
say(){try{const u=new SpeechSynthesisUtterance(S.t.qs[S.t.i].say);u.lang=({Spanish:'es-ES',French:'fr-FR'})[S.subj]||'en-GB';u.rate=.85;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){A.saytx()}},saytx(){const e=$('#saytx');if(e)e.hidden=false},
mc(v){const i=$('#ans');if(!i||i.disabled)return;i.value=v;mcUI()},
cor(){},
chk(){const q=S.t.qs[S.t.i];if(q.done)return;cap();if(!q.last){if(confirm('You have not typed an answer.\n\nPress OK to see the correct answer (no Puppies for this question), or Cancel to go back and answer it.'))fin(q);return}
if(!q.k){chk0();if(!q.done&&/^Incorrect/.test(q.fb||''))fin(q);return}
const g=mark(q,q.last);if(g.ok){q.ok=q.done=true;q.pts=PUP[S.diff];S.t.pup+=q.pts;q.fb=`Correct! 🎉 +${q.pts} ${q.pts>1?'Puppies':'Puppy'} 🐶`;cheer()}else if(g.soft){q.ok=false;q.fb=g.fb}else return fin(q);render()}});
const G10=`Use g = 10 N/kg.`;
/* ---------- Topic files to load: LOAD[subject] = [file names without .js]. Empty until GCSE question files are added.
   Example: const LOAD={Physics:['forces','energy','explain']}; loads physics/forces.js, physics/energy.js and physics/explain.js. ---------- */
const LOAD={};
for(const sj in LOAD){BANK[sj]=BANK[sj]||{};LOAD[sj].forEach(u=>{const s=document.createElement('script');s.src=sj.toLowerCase().replace(/\s+/g,'-')+'/'+u+'.js';s.async=false;document.head.append(s)})}
if(S.v=='test')render();
