/* ---------- GCSE Maths helpers. Loaded first (see LOAD in subjects.js), before the topic files.
   Each topic file adds its questions with MH.add(area, topic, [[easy],[moderate],[difficult],[very difficult]]),
   using the same question makers as the Year 8 & 9 portal: Q (exact answer), QF (fraction), N (rounded number, small tolerance),
   M (multiple choice) and T (words). The helpers below build answers that can be typed in more than one way. ---------- */
const MH=(()=>{
/* Every question passes through tidy(): a hyphen used as a minus sign before a number is shown as a proper minus sign (−)
   in the question, method, working and multiple-choice options. Typing hints "(Type it like …)" and diagrams are left alone. */
/* Float noise such as 0.8200000000000001 or 11899.999999999998 is also tidied (long decimals with a run of 0s or 9s). */
const fl=x=>x.replace(/\d+\.\d{10,}/g,v=>/(0{5,}|9{5,})\d{0,3}$/.test(v)?String(+(+v).toFixed(8)):v);
const fm=t=>typeof t!='string'?t:t.split(/(\(Type[^)]*\)|<svg[\s\S]*?<\/svg>)/).map((x,i)=>i%2?x:fl(x).replace(/(^|[\s(,=;:\[])-(?=\d)/g,'$1−')).join('');
const tidy=q=>{q.q=fm(q.q);q.m=fm(q.m);q.w=fm(q.w);if(typeof q.d=='string'&&!q.fmt)q.d=fm(q.d);if(q.k=='mc'){q.opts=q.opts.map(fm);q.a=fm(q.a);q.d=fm(q.d);q.w=fm(q.w)}return q};
const add=(area,topic,lv)=>{BANK.Maths[tkey(area,topic)]=lv.map(L=>L.map(g=>()=>tidy(g())))};
/* rounding */
const rd=(x,dp=0)=>+(Math.round(x*10**dp+(x>=0?1e-9:-1e-9))/10**dp).toFixed(dp);
const sf=(x,n=3)=>{if(!x)return 0;const p=n-1-Math.floor(Math.log10(Math.abs(x)));return p>=0?rd(x,p):Math.round(x/10**-p)*10**-p};
/* display a signed term: tm(3,'x',true) -> "+ 3x", tm(-1,'x') -> "−x" */
const tm=(k,v='',lead=false)=>{if(!k)return'';const a=Math.abs(k),c=v&&a==1?'':a;return(lead?(k<0?'−':''):(k<0?' − ':' + '))+c+v};
/* ex([[3,'x'],[-2,'']]) -> "3x − 2" */
const ex=ts=>{let s='';ts.forEach(([k,v])=>{if(!k)return;s+=tm(k,v,!s)});return s||'0'};
/* plain-text version for marking: "3x-2" */
const pl=s=>String(s).replace(/<sup>(.*?)<\/sup>/g,'^$1').replace(/−/g,'-').replace(/\s+/g,'');
/* string answers with variants. All are compared without spaces or capitals. */
const SUP={'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'};
const supt=n=>String(n).split('').map(c=>SUP[c]||c).join('');
const mins=a=>{const o=new Set();a.forEach(s=>{o.add(s);o.add(s.replace(/-/g,'−'));o.add(s.replace(/−/g,'-'))});return[...o]};
/* standard form m × 10^e */
const stdA=(m,e)=>{const ms=String(m),es=String(e),v=[];for(const x of['x','×','','*'])for(const p of['^'+es,'^('+es+')',supt(es)])v.push(ms+x+'10'+p);v.push(ms+'e'+es);const all=mins(v);return{a:all[0],alt:all,d:`${ms.replace('-','−')} × 10${supt(es)}`}};
const stdS=(m,e)=>`${String(m).replace('-','−')} × 10${supt(e)}`;
/* split a number into standard form [mantissa, exponent] */
const toStd=(x,dp=10)=>{const e=Math.floor(Math.log10(Math.abs(x))+1e-12);let m=+(x/10**e).toFixed(dp);if(Math.abs(m)>=10){return[+(m/10).toFixed(dp),e+1]}return[m,e]};
/* surds: a√b, with sqrt / root spellings accepted */
const sqf=n=>{let a=1,b=n;for(let k=2;k*k<=b;k++)while(b%(k*k)==0){b/=k*k;a*=k}return[a,b]};
const sS=(a,b)=>b==1?`${a}`:`${a==1?'':a==-1?'−':a<0?'−'+(-a):a}√${b}`;
const sV=(a,b)=>{const c=a==1?'':a==-1?'-':String(a),o=[];for(const r of['√','sqrt','sqrt(','root','r'])o.push(c+r+b+(r.endsWith('(')?')':''));if(a!=1&&a!=-1)for(const r of['√','sqrt','root'])o.push(a+'*'+r+b,a+'x'+r+b);return o};
const surdA=(a,b)=>b==1?{a:String(a),alt:[],d:String(a)}:(()=>{const v=mins(sV(a,b));return{a:v[0],alt:v,d:sS(a,b)}})();
/* p + q√b */
const surd2A=(p,q,b)=>{const qs=sV(q<0?-q:q,b),v=[];qs.forEach(s=>{v.push(`${p}${q<0?'-':'+'}${s}`);if(q>0)v.push(`${s}+${p}`);else v.push(`-${s}+${p}`)});const all=mins(v);return{a:all[0],alt:all,d:`${p} ${q<0?'−':'+'} ${sS(Math.abs(q),b)}`}};
/* coordinates and column vectors */
const crd=(x,y)=>{const v=mins([`(${x},${y})`,`${x},${y}`]);return{a:v[0],alt:v,d:`(${String(x).replace('-','−')}, ${String(y).replace('-','−')})`}};
/* ratio a:b(:c) */
const rat=(...p)=>{const v=[p.join(':'),p.join('to')];return{a:v[0],alt:v,d:p.join(' : ')}};
/* inequality x < k etc. op one of < <= > >= ; also accepts the reversed form */
const SPELL={'<':['<'],'>':['>'],'<=':['<=','≤','=<'],'>=':['>=','≥','=>']},REV={'<':'>','>':'<','<=':'>=','>=':'<='},SYM={'<':'<','>':'>','<=':'≤','>=':'≥'};
const ineqA=(v,op,k)=>{const k1=String(k),list=[];SPELL[op].forEach(o=>list.push(`${v}${o}${k1}`));SPELL[REV[op]].forEach(o=>list.push(`${k1}${o}${v}`));const all=mins(list);return{a:all[0],alt:all,d:`${v} ${SYM[op]} ${k1.replace('-','−')}`}};
/* double inequality a < x <= b */
const ineq2A=(lo,o1,v,o2,hi)=>{const list=[];SPELL[o1].forEach(a=>SPELL[o2].forEach(b=>list.push(`${lo}${a}${v}${b}${hi}`)));const all=mins(list);return{a:all[0],alt:all,d:`${String(lo).replace('-','−')} ${SYM[o1]} ${v} ${SYM[o2]} ${String(hi).replace('-','−')}`}};
/* word answers for a multiple-choice-free text answer list */
const wordA=(...w)=>({a:w[0],alt:w,d:w[0]});
/* lowest common multiple, primes, factor helpers */
const lcm=(a,b)=>a/gcd(a,b)*b;
const isP=n=>{if(n<2)return false;for(let k=2;k*k<=n;k++)if(n%k==0)return false;return true};
const pf=n=>{const o=[];for(let k=2;k*k<=n;k++)while(n%k==0){o.push(k);n/=k}if(n>1)o.push(n);return o};
const pfS=n=>{const c={};pf(n).forEach(p=>c[p]=(c[p]||0)+1);return Object.keys(c).map(p=>c[p]>1?p+supt(c[p]):p).join(' × ')};
const pfA=n=>{const c={};pf(n).forEach(p=>c[p]=(c[p]||0)+1);const ks=Object.keys(c),a=ks.map(p=>c[p]>1?`${p}^${c[p]}`:p).join('x'),b=ks.map(p=>c[p]>1?`${p}${supt(c[p])}`:p).join('×'),e=pf(n).join('x'),e2=pf(n).join('×'),v=[a,b,e,e2,a.replace(/x/g,'×'),b.replace(/×/g,'x'),a.replace(/x/g,'*'),e.replace(/x/g,'*')];return{a:v[0],alt:v,d:pfS(n)}};
/* expressions in any letters, accepted in any term order.
   terms = [[coef,'a'],[coef,'b^2'],[coef,'']] ; letters within a term are also accepted in either order (ab = ba). */
const perms=a=>a.length<2?[a]:a.flatMap((x,i)=>perms(a.filter((_,j)=>j!=i)).map(p=>[x,...p]));
const tf=([k,v],first)=>{const a=Math.abs(k),c=v&&a==1?'':String(a);return(k<0?'-':first?'':'+')+c+v};
const tvar=v=>{const m=v.match(/^([a-z](\^\d+)?)([a-z](\^\d+)?)$/);return m?[v,m[3]+m[1]]:[v]};
const exStr=ts=>ts.filter(t=>t[0]).map((t,i)=>tf(t,i==0)).join('')||'0';
const dsp=s=>String(s).replace(/\^(-?\d+)/g,(_,n)=>supt(n)).replace(/-/g,' − ').replace(/\+/g,' + ').replace(/^ − /,'−').replace(/\( − /g,'(−');
const exprA=ts=>{ts=ts.filter(t=>t[0]);const v=new Set();for(const p of perms(ts).slice(0,120)){v.add(exStr(p));/* swapped letters */v.add(exStr(p.map(([k,x])=>[k,tvar(x).pop()])))}const all=mins([...v]);return{a:exStr(ts),alt:all,d:dsp(exStr(ts))}};
/* factorised: pre (e.g. '3', '2x', '') times brackets, each bracket a list of terms */
const factA=(pre,facs)=>{const fv=facs.map(f=>{const o=new Set();perms(f.filter(t=>t[0])).forEach(p=>o.add('('+exStr(p)+')'));return[...o]});const out=new Set();const combo=(i,acc)=>{if(i==fv.length){perms(acc).forEach(p=>{const b=p.join('');out.add(pre+b);if(pre)out.add(b+pre)});return}fv[i].forEach(x=>combo(i+1,[...acc,x]))};combo(0,[]);/* repeated bracket as square */if(facs.length==2&&exStr(facs[0])==exStr(facs[1]))fv[0].forEach(x=>{out.add(pre+x+'^2');out.add(pre+x+'²')});const all=mins([...out]);const main=pre+facs.map(f=>'('+exStr(f)+')').join('');return{a:main,alt:all,d:dsp(main)}};
/* SVG: a small coordinate grid with optional curves, points and segments. Colours follow the page theme. */
const svgG=({x0=-5,x1=5,y0=-5,y1=5,fns=[],pts=[],segs=[],step=1,lab=1,W=300,H=300,xl='x',yl='y',bars=[],ylab:YL,ystep:YS})=>{const sx=x=>(x-x0)/(x1-x0)*W,sy=y=>H-(y-y0)/(y1-y0)*H;let g='',t='';const ystep=YS||step;const ys=(y1-y0)/ystep>40?Math.ceil((y1-y0)/40/ystep)*ystep:ystep,xs=(x1-x0)/step>40?Math.ceil((x1-x0)/40/step)*step:step;
for(let x=Math.ceil(x0/xs)*xs;x<=x1+1e-9;x+=xs)g+=`<line x1="${sx(x)}" y1="0" x2="${sx(x)}" y2="${H}" stroke="currentColor" stroke-opacity=".15"/>`;for(let y=Math.ceil(y0/ys)*ys;y<=y1+1e-9;y+=ys)g+=`<line x1="0" y1="${sy(y)}" x2="${W}" y2="${sy(y)}" stroke="currentColor" stroke-opacity=".15"/>`;
const ax=x0<=0&&x1>=0?sx(0):0,ay=y0<=0&&y1>=0?sy(0):H;g+=`<line x1="0" y1="${ay}" x2="${W}" y2="${ay}" stroke="currentColor" stroke-width="1.5"/><line x1="${ax}" y1="0" x2="${ax}" y2="${H}" stroke="currentColor" stroke-width="1.5"/>`;
const ylab=YL||(y1-y0>12*lab?Math.ceil((y1-y0)/10/lab)*lab:lab);
for(let x=Math.ceil(x0/lab)*lab;x<=x1+1e-9;x+=lab)if(Math.abs(x)>1e-9||ax!=sx(0))t+=`<text x="${sx(x)}" y="${ay+14}" font-size="11" text-anchor="middle" fill="currentColor">${+x.toFixed(4)}</text>`;for(let y=Math.ceil(y0/ylab)*ylab;y<=y1+1e-9;y+=ylab)if(Math.abs(y)>1e-9||ay!=sy(0))t+=`<text x="${ax-5}" y="${sy(y)+4}" font-size="11" text-anchor="end" fill="currentColor">${+y.toFixed(4)}</text>`;
bars.forEach(([a,b,h])=>{g+=`<rect x="${sx(a)}" y="${sy(h)}" width="${sx(b)-sx(a)}" height="${sy(0)-sy(h)}" fill="var(--pr)" fill-opacity=".35" stroke="var(--pr)"/>`});
fns.forEach(fn=>{let d='',pen=false;for(let i=0;i<=400;i++){const x=x0+(x1-x0)*i/400,y=fn(x);if(!isFinite(y)||y<y0-(y1-y0)||y>y1+(y1-y0)){pen=false;continue}d+=(pen?'L':'M')+sx(x).toFixed(1)+' '+sy(y).toFixed(1);pen=true}g+=`<path d="${d}" fill="none" stroke="var(--pr)" stroke-width="2.2"/>`});
segs.forEach(([a,b,c,e])=>{g+=`<line x1="${sx(a)}" y1="${sy(b)}" x2="${sx(c)}" y2="${sy(e)}" stroke="var(--pr)" stroke-width="2.2"/>`});
pts.forEach(([x,y,lb])=>{g+=`<circle cx="${sx(x)}" cy="${sy(y)}" r="3.5" fill="var(--bad)"/>`+(lb?`<text x="${sx(x)+5}" y="${sy(y)-5}" font-size="11" fill="currentColor">${lb}</text>`:'')});
return `<br><svg viewBox="-38 -22 ${W+70} ${H+46}" style="width:100%;max-width:360px;display:block;margin:8px 0;overflow:visible" role="img" aria-label="graph"><defs><clipPath id="cl"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#cl)">${g}</g>${t}<text x="${W+8}" y="${ay+4}" font-size="12" font-style="italic" fill="currentColor">${xl}</text><text x="${ax+5}" y="-8" font-size="12" font-style="italic" fill="currentColor">${yl}</text></svg>`};
/* SVG: a labelled shape. pts = [[x,y],...] in any units (y upwards); names = vertex letters; sides = labels for side i (from pts[i] to pts[i+1]);
   ang = {index: label} angle labels drawn inside the vertex; right = [vertex indices with a right-angle mark]; extra = more segments [[x1,y1,x2,y2]]. */
const svgS=({pts,names=[],sides=[],ang={},right=[],extra=[],W=300,H=210,dash=[]})=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);extra.forEach(e=>{xs.push(e[0],e[2]);ys.push(e[1],e[3])});const mnx=Math.min(...xs),mxx=Math.max(...xs),mny=Math.min(...ys),mxy=Math.max(...ys);const sc=Math.min((W-110)/((mxx-mnx)||1),(H-60)/((mxy-mny)||1));const P=([x,y])=>[55+(x-mnx)*sc,H-30-(y-mny)*sc];const c=pts.map(P);const cx=c.reduce((s,p)=>s+p[0],0)/c.length,cy=c.reduce((s,p)=>s+p[1],0)/c.length;let g=`<polygon points="${c.map(p=>p.map(v=>v.toFixed(1)).join(',')).join(' ')}" fill="var(--pr)" fill-opacity=".08" stroke="currentColor" stroke-width="1.8"/>`;
extra.forEach((e,i)=>{const a=P([e[0],e[1]]),b=P([e[2],e[3]]);g+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="currentColor" stroke-width="1.5" ${dash[i]?'stroke-dasharray="5 4"':''}/>`});
const out=(p,d)=>{const vx=p[0]-cx,vy=p[1]-cy,L=Math.hypot(vx,vy)||1;return[p[0]+vx/L*d,p[1]+vy/L*d]};
names.forEach((n,i)=>{if(!n)return;const [x,y]=out(c[i],14);g+=`<text x="${x}" y="${y+4}" font-size="13" font-weight="700" text-anchor="middle" fill="currentColor">${n}</text>`});
sides.forEach((t,i)=>{if(!t)return;const a=c[i],b=c[(i+1)%c.length];const m=[(a[0]+b[0])/2,(a[1]+b[1])/2];const [x,y]=out(m,12);const an=x<m[0]-3?'end':x>m[0]+3?'start':'middle';g+=`<text x="${x}" y="${y+(y>m[1]+3?10:y<m[1]-3?-2:4)}" font-size="12" text-anchor="${an}" fill="currentColor">${t}</text>`});
Object.entries(ang).forEach(([i,t])=>{const p=c[+i];const k=Math.min(0.28,34/Math.hypot(cx-p[0],cy-p[1]));const [x,y]=[p[0]+(cx-p[0])*k,p[1]+(cy-p[1])*k];g+=`<text x="${x}" y="${y+4}" font-size="12" text-anchor="middle" fill="var(--bad)">${t}</text>`});
right.forEach(i=>{const p=c[i],a=c[(i+c.length-1)%c.length],b=c[(i+1)%c.length];const u=(q)=>{const vx=q[0]-p[0],vy=q[1]-p[1],L=Math.hypot(vx,vy);return[vx/L*11,vy/L*11]};const [ax,ay]=u(a),[bx,by]=u(b);g+=`<path d="M${p[0]+ax},${p[1]+ay} L${p[0]+ax+bx},${p[1]+ay+by} L${p[0]+bx},${p[1]+by}" fill="none" stroke="currentColor" stroke-width="1.3"/>`});
return `<br><svg viewBox="0 0 ${W} ${H}" style="width:100%;max-width:320px;display:block;margin:8px 0" role="img" aria-label="diagram">${g}</svg>`};
/* Reading values from a graph: GR(question, value, tolerance, unit, method, working) is a number question (like N) that accepts any
   answer within ±tolerance, because values read by eye from a graph cannot be exact. The portal's marker is wrapped so that a
   question with q.tol uses it; every other question is marked exactly as before. */
const GR=(q,v,tol,u,m,w)=>{const o=N(q,v,u,m,w+`; answers from ${f(v-tol)} to ${f(v+tol)} are accepted`);o.tol=tol;return o};
/* trig in degrees */
const D2R=Math.PI/180,sinD=x=>Math.sin(x*D2R),cosD=x=>Math.cos(x*D2R),tanD=x=>Math.tan(x*D2R),asinD=x=>Math.asin(x)/D2R,acosD=x=>Math.acos(x)/D2R,atanD=x=>Math.atan(x)/D2R;
/* a few contexts */
const CITY=['Leeds','York','Bristol','Norwich','Exeter','Oxford','Cardiff','Brighton','Chester','Bath'];
const pickn=(a,k)=>shuf(a.slice()).slice(0,k);
/* fraction as text with an HTML fraction look kept plain for typing: 3/8 */
const fs=(n,d)=>frac(n,d);
/* pounds with two decimals */
const gb=x=>(+x).toFixed(2);
/* three-figure bearing */
const brg=x=>String(((x%360)+360)%360).padStart(3,'0');
return{GR,exprA,factA,exStr,dsp,svgG,svgS,perms,add,rd,sf,tm,ex,pl,supt,stdA,stdS,toStd,sqf,sS,surdA,surd2A,crd,rat,ineqA,ineq2A,wordA,lcm,isP,pf,pfS,pfA,sinD,cosD,tanD,asinD,acosD,atanD,CITY,pickn,fs,gb,brg,mins}})();
/* Graph-reading tolerance (see GR above). */
{const mark0=mark;mark=function(q,v){if(q&&q.k=='nm'&&q.tol!=null){const g=String(v).replace(/−/g,'-').replace(/,/g,'').match(/-?\d*\.?\d+/),x=g?+g[0]:NaN;return{ok:!isNaN(x)&&Math.abs(x-q.a)<=q.tol+1e-9,soft:isNaN(x),fb:'Type a number for this answer, then press Check Answer.'}}return mark0(q,v)}}
