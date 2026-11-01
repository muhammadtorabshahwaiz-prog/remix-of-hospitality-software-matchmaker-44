// @ts-nocheck
import { MAP_RUNS } from "@/lib/world-map-data";
/* eslint-disable */
// Hospitalityservis "Core" canvas engine: a circular, layered AI core suspended in a
// draggable dot-matrix world map with elevated orbiting dials and traveling signals. Charging the
// eye discharges circular shockwaves and beams; the blast returns directly to the homepage hero.
// Framework-agnostic; driven by core-stage.tsx.
export type CoreProvider = { slug: string; name: string; col: string; rate: string; cnt: number; quote: string; quote2: string };
export type CoreCategory = { slug: string; name: string; glyph: string; blurb: string; providers: CoreProvider[] };
export type CoreConfig = {
  /** silhouette of the head: oval | egg | crest */
  headShape?: 'plasma';
  categories: CoreCategory[];
  onCategory: (slug: string) => void;
  onProvider: (slug: string) => void;
  onState?: (s: { hint: boolean; released: number; paused?: boolean }) => void;
  onCore?: (kind: "single" | "double") => void;
  /** current site theme index (0-5) */
  getTheme?: () => number;
  /** current accent hue (0-360) so the core follows the site colour */
  getHue?: () => number;
  /** true while the site is in its light theme (the canvas is colour-flipped by CSS then) */
  isLight?: () => boolean;
  /** fired the instant the core explodes */
  onBlast?: () => void;
  /** fired at discharge so the host can return straight to the homepage */
  onBlank?: () => void;
};
export function createCore(cv: HTMLCanvasElement, tip: HTMLElement, cfg: CoreConfig) {
const fine=matchMedia('(pointer:fine)').matches;
const mobile=matchMedia('(pointer:coarse)').matches||Math.min(innerWidth,innerHeight)<620;
const lite=mobile||matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=(s)=>String(s).replace(/[&<>"]/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const hs=s=>{let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const CATS=cfg.categories.map((c,ci)=>{const o=[c.name,c.glyph,c.blurb];o.slug=c.slug;o.cat=ci;o.provs=c.providers.map((p,k)=>({n:p.name,slug:p.slug,col:p.col,ci,k,of:c.providers.length,rate:p.rate,cnt:p.cnt,rv:[p.quote,p.quote2]}));return o});
const PROV=CATS.flatMap(c=>c.provs);
const g=cv.getContext('2d');
let W=800,H=600,U=250,cx=400,cy=300,DPR=1,ox=0,oy=0,yaw=0,t=0,ripples=[];const cur={mx:-100,my:-100,rx:-100,ry:-100,px:0,py:0};
let dragYaw=0,dragPit=0,drag=null,lastM=false,paused=false,bl=0,blT=0,clT=0;
const rs=()=>{const w=cv.clientWidth,h=cv.clientHeight;if(!(w>8&&h>8))return;DPR=Math.min(devicePixelRatio||1,2);W=w;H=h;cv.width=W*DPR;cv.height=H*DPR;U=Math.min(W,H)*.42;cx=W/2;cy=H/2};
const ro=new ResizeObserver(rs);ro.observe(cv);rs();
function P(x,y,z){const ya=yaw+dragYaw+cur.px*.28,c=Math.cos(ya),s=Math.sin(ya);let x1=x*c+z*s,z1=-x*s+z*c;const pc=.38+dragPit+cur.py*.12,ps=Math.sin(pc),pk=Math.cos(pc);let y1=y*pk-z1*ps,z2=y*ps+z1*pk;const f=5*U,k=f/(f+z2);return{x:cx+ox+x1*k,y:cy+oy+y1*k,s:k,z:z2}}
// state
let ph='idle',pt=0,charge=0,appear=1,mult=1,flash=0,veilA=0,released=0,spin=0,bt=99,ksNow=1,cyc=0,away=false,sent=false,near=0,sa=0,ash=[],rad=[],disp=[],dust=[],waves=[];
let cwT=0,pgT=1,cwaves=[],pings=[],cwB=false;const eye={x:0,y:0};
const thm=()=>(cfg.getTheme?cfg.getTheme():cyc)%6;
const pm={x:0,y:0,in:false,hov:false};
const fib=(i,n)=>{const y=1-2*(i+.5)/n,r=Math.sqrt(1-y*y),a=i*2.39996;return[Math.cos(a)*r,y,Math.sin(a)*r]};
// ---- world map: 1-degree land dot grid (runs of land cells per latitude row, row 0 = 89.5N) ----
const MAPRUNS=MAP_RUNS;
const TD=[[],[],[]];
MAPRUNS.forEach((runs,r)=>{const lat=89.5-r;runs.forEach(([s0,n])=>{for(let c=s0;c<s0+n;c++){if(lite&&(r%2||c%2))continue;
  TD[(r*7+c*13)%9===0?2:((r+c)%4===0?1:0)].push(-180+c+.5,lat)}})});
// network nodes: [name, lon, lat, region]  (0 N.America 1 S.America 2 Europe 3 Africa 4 Middle East 5 S.Asia 6 E.Asia 7 SE.Asia 8 Oceania 9 N/C Asia)
const NODES=[['San Francisco',-122.4,37.8,0],['New York',-74,40.7,0],['Toronto',-79.4,43.7,0],['Mexico City',-99.1,19.4,0],['Sao Paulo',-46.6,-23.5,1],['Buenos Aires',-58.4,-34.6,1],['Bogota',-74.1,4.7,1],
['London',-.1,51.5,2],['Paris',2.3,48.9,2],['Berlin',13.4,52.5,2],['Madrid',-3.7,40.4,2],['Stockholm',18.1,59.3,2],['Moscow',37.6,55.8,9],['Istanbul',29,41,4],
['Cairo',31.2,30,3],['Lagos',3.4,6.5,3],['Nairobi',36.8,-1.3,3],['Johannesburg',28,-26.2,3],['Dubai',55.3,25.2,4],['Riyadh',46.7,24.7,4],['Tehran',51.4,35.7,4],
['Karachi',67,24.9,5],['Islamabad',73,33.7,5],['Mumbai',72.8,19.1,5],['Delhi',77.2,28.6,5],['Bengaluru',77.6,13,5],['Dhaka',90.4,23.8,5],['Colombo',79.9,6.9,5],['Kathmandu',85.3,27.7,5],
['Bangkok',100.5,13.8,7],['Yangon',96.2,16.8,7],['Singapore',103.8,1.35,7],['Jakarta',106.8,-6.2,7],['Kuala Lumpur',101.7,3.1,7],['Hanoi',105.8,21,7],['Manila',121,14.6,7],
['Hong Kong',114.2,22.3,6],['Shanghai',121.5,31.2,6],['Beijing',116.4,39.9,6],['Chengdu',104,30.7,6],['Seoul',127,37.6,6],['Tokyo',139.7,35.7,6],['Taipei',121.5,25,6],
['Almaty',76.9,43.2,9],['Novosibirsk',83,55,9],['Sydney',151.2,-33.9,8],['Perth',115.9,-31.9,8],['Auckland',174.8,-36.9,8]];
const CITIES=NODES.map(n=>[n[1],n[2]]);
const NS=NODES.map((n,i)=>({ph:(i*2.399)%6.283,rate:.55+((i*37)%11)/11,flare:0,hov:0,x:-999,y:-999}));
// faint backbone: every node linked to its two nearest neighbours
const LINKS=[];{const seen=new Set();NODES.forEach((a,i)=>{NODES.map((b,j)=>[j,Math.hypot(((b[1]-a[1]+540)%360)-180,b[2]-a[2])]).filter(q=>q[0]!==i).sort((x,y)=>x[1]-y[1]).slice(0,2).forEach(q=>{const k=Math.min(i,q[0])+'-'+Math.max(i,q[0]);if(!seen.has(k)){seen.add(k);LINKS.push([i,q[0]])}})})}
let mapLon=100,mapLat=26,zoom=1,zoomT=1,mapVel=0,ppd=8,rays=[],rayT=0,rayId=0,plates=[];
const RSPEED=['SLOW','NORMAL','FAST'],RMUL=[.35,1,2.8];
// ---- orbiters and professional light-color palette ----
const SH=[[.5,.5,.2,1],[.62,-.9,.6,-1],[.74,1.2,-.5,1],[.86,-.3,-1.0,-1],[.98,.8,.9,1]];
const orb=[...PROV.filter(p=>p.k<p.of-1).map(p=>({p,t:'p'})),...CATS.map(c=>{const p=c.provs[c.provs.length-1];return{p,t:'r',txt:p.rv[0]}})];
const rnd=(q=>()=>(q=(q*16807+11)%2147483647)/2147483647)(7);
orb.forEach((o,i)=>{o.sl=1;o.hv=0;o.vf=0;o.sx=-999;o.sy=-999;o.pr=(rnd()-.5)*.14;const pv=orb[i-1];
  if(i%6==5&&pv){o.orb=pv.orb;o.sh=1;o.th=pv.th+Math.PI}
  else{const r=.4+rnd()*.5;o.orb=[r,(rnd()-.5)*3,(rnd()-.5)*3,rnd()<.5?1:-1,.72+rnd()*.28];o.th=rnd()*6.283}
  o.w=o.sh?pv.w:o.orb[3]*(.8+rnd()*.8)*1.15/Math.sqrt(o.orb[0]*2)});
const ordA=orb.map((_,i)=>i).sort(()=>rnd()-.5);orb.forEach((o,i)=>o.ord=ordA.indexOf(i));
const live=orb.filter((_,i)=>i%(lite?8:6)==0).slice(0,lite?6:10);
function flyPos(o,q){if(o.sp===undefined||o.sp>=1)return q;const u=o.sp,k=1-u,e=k*k;return{x:q.x+(o.fx-q.x)*e+Math.sin(u*3.14)*50*k*o.sw,y:q.y+(o.fy-q.y)*e+Math.cos(u*3.14)*50*k*o.sw,s:q.s,z:q.z}}
function spawn(x,y){if(ph!=='idle'||appear<.9)return;const c=orb.filter(o=>!live.includes(o));if(!c.length){typeof toast==='function'&&toast('The network is full: every icon is in orbit.');return}const o=c[Math.floor(Math.random()*c.length)];o.fx=x;o.fy=y;o.sp=0;o.sw=Math.random()<.5?1:-1;o.vf=0;o.sl=1;o.hv=0;live.push(o);ripples.push({x,y,t:0})}
// ---- Ultron-style layered shells: tilted concentric rings rotating in 3D around the nucleus ----
const LAYERS=Array.from({length:lite?8:13},(_,i)=>({r:.42+i*.05,tx:(rnd()-.5)*2.7,tz:(rnd()-.5)*2.7,dir:i%2?-1:1,sp:.12+rnd()*.42,kind:i%5,ph:rnd()*6.283,wob:.08+rnd()*.22,pts:[],out:[]}));
function layersCalc(k){const N=lite?60:96;
  LAYERS.forEach(Ly=>{const rot=Ly.ph+t*Ly.sp*Ly.dir*(1+Math.sqrt(mult)*.6),sh=[Ly.r,Ly.tx+Math.sin(t*Ly.wob+Ly.ph)*.22,Ly.tz+Math.cos(t*Ly.wob*.8+Ly.ph)*.22,1,1];
    Ly.rot=rot;Ly.sh=sh;Ly.N=N;Ly.pts.length=0;Ly.out.length=0;
    for(let j=0;j<=N;j++){const th=rot+j/N*6.283;Ly.pts.push(orbPos(sh,th,k));if(Ly.kind===2){const s2=[Ly.r*1.06,sh[1],sh[2],1,1];Ly.out.push(orbPos(s2,th,k))}}})}
function layers(front,la){
  if(la<.02)return;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  LAYERS.forEach((Ly,i)=>{const P0=Ly.pts,N=Ly.N,kind=Ly.kind,pulse=.8+.2*Math.sin(t*2+i);
    const seg=(a,b,w,al,l)=>{const z=(a.z+b.z)/2;if((z>0)===front)return;const fa=z>0?.55:1;g.strokeStyle=col(Math.min(1,al*1.9*la*fa*pulse*(1+charge*.6)),l);g.lineWidth=w*1.15*Math.max(.6,(a.s+b.s)/2);g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke()};
    for(let j=0;j<N;j++){
      if(kind===0){if((j%24)<17)seg(P0[j],P0[j+1],1.7,.5,66)}
      else if(kind===1){if(j%2===0)seg(P0[j],P0[j+1],1,.4,74)}
      else if(kind===2){seg(P0[j],P0[j+1],.8,.16,70);if(j%(N/24|0||1)===0){const o=Ly.out[j];seg(P0[j],o,1.1,.55,78)}}
      else if(kind===3){seg(P0[j],P0[j+1],.8,.14,70);if(((j+(Ly.rot*10|0))%N)<N*.14)seg(P0[j],P0[j+1],4,.5,64)}
      else{if(j%3===0){const q=P0[j],z=q.z;if((z>0)!==front){g.fillStyle=col(.7*la*(z>0?.55:1)*pulse,80);g.beginPath();g.arc(q.x,q.y,1.3*q.s,0,6.283);g.fill()}}}}
    // a bright data packet with a short trail circling each shell
    const u=((t*Ly.sp*1.6*Ly.dir*(1+Math.sqrt(mult)*.5)+Ly.ph)%6.283+6.283)%6.283/6.283;
    for(let tr=0;tr<8;tr++){const idx=((Math.floor(u*N)-tr*Ly.dir)%N+N)%N,q=P0[idx];if((q.z>0)===front)continue;g.fillStyle=col((.9-tr*.1)*la*(q.z>0?.6:1),88);g.beginPath();g.arc(q.x,q.y,(tr===0?2.2:1.4)*q.s,0,6.283);g.fill()}
  });
  g.restore()}
const BR=CATS.map((c,i)=>{const f=fib(i,CATS.length);return{c,v:f.map(v=>v*1.1)}});
const PAL=[[186,194],[188,198],[180,190],[190,200],[184,192],[186,196]],hue=()=>{if(cfg.getHue)return cfg.getHue()+charge*10;const p=PAL[thm()];return p[0]+(p[1]-p[0])*charge},col=(a,l=68)=>`hsla(${hue()},88%,${l}%,${a})`;
const ease=x=>1-Math.pow(1-x,3),ss=(a,b,x)=>{const u=Math.max(0,Math.min(1,(x-a)/(b-a)));return u*u*(3-2*u)};
let hits=[];
// Individually elevated circular dials: solid faces, a visible edge, and a soft contact shadow.
const AI_HUES=[186,199,164,326,42,210],aiHue=seed=>AI_HUES[Math.abs(Math.floor(seed))%AI_HUES.length];
function dial3(x,y,r,h,a,seed,label){
  if(!(a>.01)||!(r>0))return;
  const alpha=Math.max(0,Math.min(1,a));
  g.save();g.globalAlpha=alpha;g.globalCompositeOperation='source-over';
  // Flat disc with only a soft shadow underneath (no stacked 3D edge).
  g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=Math.max(6,r*.7);g.shadowOffsetY=Math.max(2,r*.28);
  g.fillStyle=`hsl(${h},62%,66%)`;g.beginPath();g.arc(x,y,r,0,6.283);g.fill();
  g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;
  g.strokeStyle=`hsl(${h},80%,86%)`;g.lineWidth=Math.max(1,r*.07);g.beginPath();g.arc(x,y,r*.9,0,6.283);g.stroke();
  if(label){g.fillStyle='#10232c';g.font=`700 ${Math.max(8,r*.82)}px "IBM Plex Mono",monospace`;g.textAlign='center';g.textBaseline='middle';g.fillText(label,x,y+r*.03)}
  g.restore()}
function chip(x,y,s,a,p,txt){
  const r=(txt?9:12)*s;
  dial3(x,y,r*1.15,txt?186:aiHue(hs(p.n)),a,txt?1.7:(hs(p.n)%628)/100,txt?'\u201c':p.n[0]);
  return r+3*s}
// hover expansion card: a minimal in-canvas interface listing the profile's features
function hoverCard(o,q,hw){const a=o.hv;if(a<.05)return;const p=o.p;const w=196,h=80;let x=q.x+hw+14,y=q.y-h*.45;
  x=Math.max(8,Math.min(W-w-8,x));y=Math.max(8,Math.min(H-h-8,y));
  g.save();g.globalAlpha=a;
  g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=22;g.shadowOffsetY=10;
  g.fillStyle='rgb(6,12,20)';g.fillRect(x,y,w,h);g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetY=0;g.strokeStyle=o.p.col;g.lineWidth=1;g.strokeRect(x+.5,y+.5,w-1,h-1);
  g.fillStyle=o.p.col;g.fillRect(x,y,3,h);
  g.textBaseline='alphabetic';g.textAlign='left';
  g.fillStyle='#eaf4ff';g.font='700 11px "IBM Plex Mono",monospace';g.fillText((o.txt?CATS[p.ci][0]:p.n).slice(0,24),x+13,y+19);
  g.fillStyle=col(.95,76);g.font='600 9px "IBM Plex Mono",monospace';g.fillText(o.txt?('◆ '+p.n).slice(0,30):('★ '+p.rate+' · '+p.cnt+' SAMPLE REVIEWS').slice(0,30),x+13,y+35);
  g.fillStyle='#93a7bd';g.font='italic 9.5px Georgia,serif';
  const quote=(o.txt?o.txt:p.rv[0])||'';g.fillText(('“'+quote+'”').slice(0,36),x+13,y+52);
  g.fillStyle='#5f7387';g.font='600 8px "IBM Plex Mono",monospace';
  g.fillText((o.txt?'CATEGORY RECAP · ':'PROFILE · ')+'CLICK TO OPEN',x+13,y+69);
  g.restore()}
function streak(o,kk,v,q){const vf=o.vf;if(vf<.03)return;const dir=o.w<0?-1:1,span=.25+vf*5.6,N=24;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';let prev=q;
  for(let b=0;b<4;b++){g.beginPath();g.moveTo(prev.x,prev.y);for(let j=b*6+1;j<=b*6+6;j++){const p=orbPos(o.orb,o.th-dir*span*j/N,kk);g.lineTo(p.x,p.y);prev=p}
    g.strokeStyle=col((.85-b*.2)*(.3+.7*vf)*v,70+vf*18);g.lineWidth=(2.6-b*.4)*q.s*(1+vf);g.stroke()}
  if(vf>.3){g.fillStyle=col(.9*vf*v,85);g.beginPath();g.arc(q.x,q.y,3.5*q.s,0,6.283);g.fill()}
  g.restore()}
function orbW(sh,th,k){const r=sh[0]*U*k;let x=Math.cos(th)*r,y=0,z=Math.sin(th)*r*sh[4];let c=Math.cos(sh[1]),s=Math.sin(sh[1]);let y1=y*c-z*s,z1=y*s+z*c;c=Math.cos(sh[2]);s=Math.sin(sh[2]);return[x*c-y1*s,x*s+y1*c,z1]}
function orbPos(sh,th,k){const w=orbW(sh,th,k);return P(w[0],w[1],w[2])}
function bez(a,b,c,u){const v=1-u;return{x:v*v*a.x+2*v*u*b.x+u*u*c.x,y:v*v*a.y+2*v*u*b.y+u*u*c.y}}
// ---- world map helpers ----
const wrapRel=(lon)=>((lon-mapLon+540)%360+360)%360-180;
function cityPt(lon,lat){return[cx+wrapRel(lon)*ppd,cy+(mapLat-lat)*ppd]}
function newRay(from){const a=from!==undefined?from:(Math.random()*NODES.length|0);let b=a,tries=0;
  while(b===a||(NODES[b][3]===NODES[a][3]&&tries<10&&Math.random()<.85)){b=Math.random()*NODES.length|0;tries++}
  const dl=((NODES[b][1]-NODES[a][1]+540)%360)-180,dk=NODES[b][2]-NODES[a][2];
  rays.push({a,b,dl,dk,deg:Math.max(8,Math.hypot(dl,dk)),u:0,dps:20+Math.random()*14,lvl:1,msg:0,x:-999,y:-999,id:++rayId});
  NS[a].flare=Math.max(NS[a].flare,.7);pings.push({c:a,t:0})}
function flareNode(i){NS[i].flare=1;pings.push({c:i,t:0});if(rays.length<24)newRay(i)}
function cycleRay(r){r.lvl=(r.lvl+1)%3;r.msg=2.4;ripples.push({x:r.x,y:r.y,t:0})}
function plate(x,y,txt,a){plates.push([x,y,txt,a])}
function drawPlates(){plates.forEach(([x,y,txt,a])=>{g.save();g.globalAlpha=Math.max(0,Math.min(1,a));g.font='600 10px "IBM Plex Mono",monospace';
  const w=g.measureText(txt).width+16,h=21,px=Math.max(6,Math.min(W-w-10,x+12)),py=Math.max(6,Math.min(H-h-10,y-h-10));
  g.fillStyle=`hsl(${hue()},45%,12%)`;g.fillRect(px+3,py+3,w,h);g.fillStyle='rgb(9,13,19)';g.fillRect(px,py,w,h);
  g.strokeStyle=col(.95,68);g.lineWidth=1;g.strokeRect(px+.5,py+.5,w-1,h-1);g.fillStyle=col(1,68);g.fillRect(px,py,3,h);
  g.fillStyle='#e6eef8';g.textAlign='left';g.textBaseline='middle';g.fillText(txt,px+9,py+h/2+.5);g.restore()});plates=[]}
function mapBG(ma,coreR){
  if(ma<=0)return;
  const LM=document.documentElement.dataset.mode==='light';
  ppd=Math.max(W/165,H/105)*zoom;
  const live_=ph==='idle'&&ma>.6,hv=pm.in&&pm.h?pm.h:null;
  g.save();
  // graticule: faint lat/lon lines
  g.strokeStyle=`rgba(130,140,158,${(LM?.2:.07)*ma})`;g.lineWidth=1;g.beginPath();
  for(let lo=-180;lo<180;lo+=30){const x=cx+wrapRel(lo)*ppd;if(x<-2||x>W+2)continue;g.moveTo(Math.round(x)+.5,0);g.lineTo(Math.round(x)+.5,H)}
  for(let la=-60;la<=80;la+=30){const y=Math.round(cy+(mapLat-la)*ppd)+.5;g.moveTo(0,y);g.lineTo(W,y)}
  g.stroke();
  // land: dark-gray dot matrix, three brightness tiers, batched
  const sz=Math.max(1.4,Math.min(4.2,ppd*.36))*(LM?1.2:1),h2=sz/2,AL=LM?[.55,.78,1]:[.26,.4,.68];
  for(let k=0;k<3;k++){g.fillStyle=`rgba(148,157,170,${AL[k]*ma})`;g.beginPath();const A=TD[k];
    for(let i=0;i<A.length;i+=2){const x=cx+wrapRel(A[i])*ppd,y=cy+(mapLat-A[i+1])*ppd;if(x<-4||x>W+4||y<-4||y>H+4)continue;g.rect(x-h2,y-h2,sz,sz)}g.fill()}
  g.globalCompositeOperation='lighter';
  // node positions
  for(let i=0;i<NODES.length;i++){const q=cityPt(NODES[i][1],NODES[i][2]);NS[i].x=q[0];NS[i].y=q[1]}
  // backbone links
  g.strokeStyle=col((LM?.16:.05)*ma,60);g.lineWidth=1;g.beginPath();
  LINKS.forEach(([i,j])=>{const A=NS[i],B=NS[j],dx=((NODES[j][1]-NODES[i][1]+540)%360-180)*ppd;if(A.x<-300||A.x>W+300)return;g.moveTo(A.x,A.y);g.lineTo(A.x+dx,B.y)});g.stroke();
  // nodes: each lights up and dims on its own rhythm; clicking one makes it flare and fire a ray
  const cr2=coreR*2.3;
  for(let i=0;i<NODES.length;i++){const n=NS[i],x=n.x,y=n.y;if(x<-20||x>W+20||y<-20||y>H+20)continue;
    n.flare=Math.max(0,n.flare);const tw=Math.pow(.5+.5*Math.sin(t*n.rate+n.ph),6)*.75,lit=Math.max(n.flare,tw),hov=hv&&hv.node===i;n.hov+=((hov?1:0)-n.hov)*.2;
    g.fillStyle=`rgba(205,212,224,${(.22+.4*lit+.3*n.hov)*ma})`;g.fillRect(x-1.5,y-1.5,3,3);
    g.fillStyle=col((.12+.88*Math.max(lit,n.hov))*ma,58+lit*28);g.beginPath();g.arc(x,y,1.7+2.7*Math.max(lit,n.hov*.8),0,6.283);g.fill();
    if(lit>.1){g.strokeStyle=col(lit*.5*ma,76);g.lineWidth=1;g.beginPath();g.arc(x,y,4.5+lit*8,0,6.283);g.stroke()}
    if(n.flare>.02){const u=1-n.flare;g.strokeStyle=col(n.flare*.7*ma,82);g.lineWidth=1.6;g.beginPath();g.arc(x,y,7+u*34,0,6.283);g.stroke();
      g.strokeStyle=col(n.flare*.35*ma,82);g.beginPath();g.arc(x,y,4+u*18,0,6.283);g.stroke()}
    if(live_&&Math.hypot(x-cx,y-cy)>cr2)hits.push({x,y,r:13,map:1,node:i,go:()=>flareNode(i)})}
  // rays: light packets racing along arcs between continents; click one to cycle slow / normal / fast
  for(const r of rays){const A=NS[r.a],x1=A.x,y1=A.y,x2=x1+r.dl*ppd,y2=y1-r.dk*ppd,dist=Math.hypot(x2-x1,y2-y1)||1,mx=(x1+x2)/2,my=(y1+y2)/2-dist*.24;
    const at=(u)=>{const v=1-u;return[v*v*x1+2*v*u*mx+u*u*x2,v*v*y1+2*v*u*my+u*u*y2]};
    g.strokeStyle=col((LM?.22:.07)*ma,64);g.lineWidth=LM?1.3:1;g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(mx,my,x2,y2);g.stroke();
    const tail=Math.min(.14,11/r.deg),N=12;let pr=at(r.u);r.x=pr[0];r.y=pr[1];
    g.lineCap='round';
    for(let j=0;j<N;j++){const u1=r.u-tail*(j+1)/N;if(u1<0)break;const q=at(u1),f=1-j/N;g.strokeStyle=col(.9*f*ma,70+f*20);g.lineWidth=.5+1.0*f*(r.lvl===2?1.3:1);g.beginPath();g.moveTo(pr[0],pr[1]);g.lineTo(q[0],q[1]);g.stroke();pr=q}
    g.fillStyle=col(.25*ma,80);g.beginPath();g.arc(r.x,r.y,6,0,6.283);g.fill();g.fillStyle=col(ma,90);g.beginPath();g.arc(r.x,r.y,2.4,0,6.283);g.fill();
    const rh=hv&&hv.ray===r;if(r.msg>0||rh)plate(r.x,r.y,'SIGNAL · '+RSPEED[r.lvl],Math.min(1,r.msg>0?r.msg:1)*ma);
    if(live_&&r.x>-20&&r.x<W+20&&Math.hypot(r.x-cx,r.y-cy)>cr2)hits.push({x:r.x,y:r.y,r:16,map:1,ray:r,go:()=>cycleRay(r)})}
  // expanding ping ripples: signals landing somewhere on the planet
  for(const pg of pings){if(pg.t<0)continue;const p=cityPt(CITIES[pg.c][0],CITIES[pg.c][1]);const u=pg.t/2.2;
    g.strokeStyle=col((1-u)*.5*ma,80);g.lineWidth=1.3;g.beginPath();g.arc(p[0],p[1],3+u*30,0,6.283);g.stroke()}
  g.restore()}
function blast(){paused=false;sent=false;away=false;ph='blast';pt=0;flash=1;waves=[{t:0},{t:-.25},{t:-.5},{t:-.75}];released+=PROV.length;disp=live.map(o=>{const w=orbW(o.orb,o.th,ksNow),l=Math.hypot(w[0],w[1],w[2])||1,sp=(.08+Math.random()*.2)*U;ashFrom(w[0],w[1],w[2],o.p.col,Math.round((lite?9:18)*(1-o.vf)));return{o,x:w[0],y:w[1],z:w[2],vx:w[0]/l*sp,vy:w[1]/l*sp,vz:w[2]/l*sp}});
  rad=[];
  dust=Array.from({length:lite?90:220},()=>{const v=fib(Math.random()*900|0,900).map(q=>q*(.2+Math.random()*1.1)*U);return{x:0,y:0,z:0,vx:v[0],vy:v[1],vz:v[2],h:Math.random()}});nextSkin();needReset=true;pulses=[];emit(false);cfg.onBlast&&cfg.onBlast();cfg.onBlank&&cfg.onBlank();}
let lastHint=null,lastRel=-1,lastP=false;const emit=(h)=>{h=h||paused;if(h!==lastHint||released!==lastRel||paused!==lastP){lastHint=h;lastRel=released;lastP=paused;cfg.onState&&cfg.onState({hint:h,released,paused})}};
function update(dt){if(paused&&ph==='idle')dt=0;else paused=false;
  {coreZoom+=(coreZoomT-coreZoom)*Math.min(1,dt*8);if(!cdrag){coreRot.vy+=((.32+charge*1.6)-coreRot.vy)*Math.min(1,dt*1.2);coreRot.y+=coreRot.vy*dt;coreRot.x+=(.38-coreRot.x)*Math.min(1,dt*.6)}absF=Math.max(0,absF-dt*1.6);
   const rate=(ph==='idle'&&appear>.05)?(charge>.03?1.2+charge*4.5:(bt<6?1.2:.35)):0;pulseAcc+=rate*dt;while(pulseAcc>=1){pulseAcc-=1;spawnPulse()}
   for(let i=pulses.length-1;i>=0;i--){const p=pulses[i];p.u+=dt*p.sp;if(p.u>=1){if(p.in)absF=Math.min(1.5,absF+.22);pulses.splice(i,1)}}}
  blT=Math.max(0,blT-dt);bl+=((blT>0?1:0)-bl)*Math.min(1,dt*3);
  t+=dt;pt+=dt;mult=1+10*Math.pow(charge,1.6);const coreR=.15*U;
  pm.hov=pm.in&&ph==='idle'&&appear>.95&&Math.hypot(pm.x-cx,pm.y-cy)<coreR*2.3;
  if(ph==='idle'){bt+=dt;appear=Math.min(1,bt/6);veilA=Math.max(0,veilA-dt/2.2);
    charge=pm.hov?charge+dt/30:Math.max(0,charge-dt/4);if(charge>=1){charge=1;blast()}
    live.forEach(o=>{if(o.sp<1)o.sp=Math.min(1,o.sp+dt/1.5);const d=pm.in?Math.hypot(o.sx-pm.x,o.sy-pm.y):999,fr=pm.hov||near>.7,hd=((d<22&&!fr)?(o.hold=1):(o.hold=fr?0:Math.max(0,(o.hold||0)-dt))),tg=fr?1.35:o.hold>0?.03:Math.min(1.25,.72+Math.pow(d/130,2)*.35);o.sl+=(tg-o.sl)*Math.min(1,dt*(tg>o.sl?1.3:9));o.hv+=((d<22?1:0)-o.hv)*Math.min(1,dt*10);const S=mult*Math.abs(o.w)*o.sl,tv=Math.max(ss(3.5,6,S),ss(.9,.98,charge));o.vf+=(tv-o.vf)*Math.min(1,dt*3);o.th+=o.w*mult*dt*o.sl;if(!o.sh)o.orb[1]+=o.pr*dt})}
  else if(ph==='blast'){flash=Math.max(0,flash-dt/1.3);if(pt>2.8){ph='idle';pt=0;appear=0;bt=0;cyc++;orb.forEach(o=>o.vf=0);charge=0;rad=[];disp=[];dust=[];ash=[]}}
  if(!drag){dragYaw*=Math.pow(.6,dt);dragPit*=Math.pow(.6,dt)}spin+=dt*(.5+.9*Math.sqrt(mult));yaw+=dt*(.1+.22*charge);
  const sh=Math.pow(charge,3)*7;ox=(Math.random()-.5)*sh;oy=(Math.random()-.5)*sh;
  disp.forEach(r=>{r.x+=r.vx*dt;r.y+=r.vy*dt;r.z+=r.vz*dt;const d=Math.pow(.7,dt);r.vx*=d;r.vy*=d;r.vz*=d});rad.forEach(r=>{r.x+=r.vx*dt;r.y+=r.vy*dt;r.z+=r.vz*dt;const d=Math.pow(.62,dt);r.vx*=d;r.vy*=d;r.vz*=d});
  dust.forEach(r=>{r.x+=r.vx*dt;r.y+=r.vy*dt;r.z+=r.vz*dt});
  waves.forEach(w=>w.t+=dt);
  // charge radiation: shockwave rings emitted ever faster, then big blast rings
  cwT-=dt;if(ph==='idle'&&charge>0.03&&cwT<=0){cwaves.push({t:0});cwT=(1.5-1.35*charge)*(0.7+Math.random()*0.6)}
  if(ph==='blast'&&!cwB){cwB=true;cwaves.push({t:0,big:1},{t:-.25,big:1},{t:-.5,big:1})}
  if(ph!=='blast')cwB=false;
  cwaves.forEach(w=>w.t+=dt);cwaves=cwaves.filter(w=>w.t<(w.big?2.4:1.5));
  // city pings + pupil tracking
  pgT-=dt;if(ph==='idle'&&pgT<=0){pgT=(lite?2.4:1.2)+Math.random()*1.2;pings.push({c:(Math.random()*CITIES.length)|0,t:0})}
  pings.forEach(p=>p.t+=dt);pings=pings.filter(p=>p.t<2.2);
  // world map: gentle eastward drift (inertia after a drag), smooth zoom, a steady supply of rays
  zoom+=(zoomT-zoom)*Math.min(1,dt*6);
  if(!drag){mapLon+=(mapVel+(lite?.45:1.0))*dt;mapVel*=Math.pow(.04,dt)}
  for(const r of rays){r.u+=dt*r.dps*RMUL[r.lvl]/r.deg;r.msg=Math.max(0,r.msg-dt);if(r.u>=1){r.done=1;NS[r.b].flare=1;pings.push({c:r.b,t:0})}}
  rays=rays.filter(r=>!r.done);NS.forEach(n=>{n.flare=Math.max(0,n.flare-dt*.45)});
  rayT-=dt;const maxR=Math.round((lite?3:7)*(1+charge*1.2));if(ph==='idle'&&rayT<=0&&rays.length<maxR){newRay();rayT=.3+Math.random()*.8}
  if(ph!=='idle'&&ph!=='blast')rays=[];
  const eK=Math.min(1,dt*4),tx=pm.in?Math.max(-1,Math.min(1,(pm.x-cx)/(W*.22))):0,ty2=pm.in?Math.max(-1,Math.min(1,(pm.y-cy)/(H*.22))):0;
  eye.x+=(tx-eye.x)*eK;eye.y+=(ty2-eye.y)*eK;
  ash.forEach(a=>{a.age+=dt;a.x+=a.vx*dt+Math.sin(t*2+a.s)*.03*U*dt;a.y+=a.vy*dt-.035*U*dt;a.z+=a.vz*dt;const d=Math.pow(.35,dt);a.vx*=d;a.vy*=d;a.vz*=d});ash=ash.filter(a=>a.age<a.life);
  if(ph==='blast'&&pt>.7&&!rad.ashed){rad.ashed=1;rad.forEach(r=>ashFrom(r.x,r.y,r.z,r.p.col,10))}
  const d0=Math.hypot(pm.x-cx,pm.y-cy),tn=(pm.in&&ph==='idle'&&appear>.9)?Math.max(0,Math.min(1,1.15-d0/(coreR*7))):0;near+=(tn-near)*Math.min(1,dt*(tn>near?4:1.1));
  sa+=((pm.in?1:0)-sa)*Math.min(1,dt*(pm.in?6:.8));
  emit(ph==='idle'&&charge<.02&&appear>.9);document.documentElement.dataset.coreBusy=(ph!=='idle'||charge>.02||appear<.9)?'1':'0';
  const k=Math.min(1,dt*(pm.in?3:.9));cur.px+=((pm.in?pm.x/W*2-1:0)-cur.px)*k;cur.py+=((pm.in?pm.y/H*2-1:0)-cur.py)*k;
  ripples.forEach(r=>r.t+=dt);ripples=ripples.filter(r=>r.t<.8)}
function draw(){
  g.setTransform(DPR,0,0,DPR,0,0);g.fillStyle='#070b10';g.fillRect(0,0,W,H);
  hits=[];const idle=ph==='idle',blast_=ph==='blast';
  const oa=idle?1:(blast_?Math.max(0,1-pt*1.8):0),ba=idle?Math.max(0,Math.min(1,(bt-3.5)/2.5)):(blast_?Math.max(0,1-pt*1.8):0),ks=(.7+.3*appear)*(1-.18*charge*charge-(charge>.93?(charge-.93)/.07*.3:0));
  const UL=nucleusKind==='ultron';ksNow=ks;let cs=idle?.05+.95*ease(appear):(blast_?1.3*(1-ease(Math.min(1,pt/.55))):.05);
  const coreR=.15*U,R=coreR*cs*(1+.04*Math.sin(t*3*(1+charge*4)))*(1+near*.12);
  const O=P(0,0,0);
  const ma=blast_?Math.max(0,1-pt*1.3):1;
  mapBG(ma,coreR);
  g.globalCompositeOperation='lighter';
  // branches
  if(0)BR.forEach((b,i)=>{const n=P(b.v[0]*U*ks,b.v[1]*U*ks,b.v[2]*U*ks),lit=bl;
    const m=P(b.v[0]*U*ks*.5+Math.sin(i*2.1)*U*.12,b.v[1]*U*ks*.5+Math.cos(i*1.7)*U*.12,b.v[2]*U*ks*.5);
    g.strokeStyle=col((.1+lit*.55)*ba);g.lineWidth=1+lit;g.beginPath();g.moveTo(O.x,O.y);g.quadraticCurveTo(m.x,m.y,n.x,n.y);g.stroke();
    if(charge>.02){const u=(t*.25*Math.sqrt(mult)+i*.137)%1,q=bez(O,m,n,u);g.fillStyle=col(.9*ba,80);g.beginPath();g.arc(q.x,q.y,2,0,6.283);g.fill()}
    b.c.provs.forEach((p,k)=>{const a=k*2.094+i,sx=n.x+Math.cos(a)*30*n.s,sy=n.y+Math.sin(a)*30*n.s;
      g.strokeStyle=col(.14*ba);g.lineWidth=1;g.beginPath();g.moveTo(n.x,n.y);g.lineTo(sx,sy);g.stroke();
      b.sub=b.sub||[];b.sub[k]={x:sx,y:sy,s:n.s,z:n.z,p}});b.n=n;b.lit=lit});
  const la=Math.min(1,appear)*oa;if(!UL){layersCalc(ks);layers(false,la)}
  g.globalCompositeOperation='source-over';
  // collect drawables
  const L=[];
  if(oa>.01){
    // orbiting bubbles: few, dim (≈20%) until hovered, then they expand into a feature card
    if(idle&&!UL)live.forEach(o=>{const v=Math.max(0,Math.min(1,(bt-.8-o.ord*.1)/1.2)),kk=ks*(.1+.9*ease(v)),q=flyPos(o,orbPos(o.orb,o.th,kk));o.sx=v>.6?q.x:-999;o.sy=v>.6?q.y:-999;
      L.push({z:q.z,f:()=>{
        g.save();g.globalAlpha=oa*v*(.72+.28*o.hv);g.strokeStyle=col(.5);g.lineWidth=1.4*q.s;const q2=orbPos(o.orb,o.th-o.w*Math.min(.05*mult,.5)*.5*o.sl,kk);g.beginPath();g.moveTo(q.x,q.y);g.lineTo(q2.x,q2.y);g.stroke();g.restore();
        streak(o,kk,v*(.35+.65*o.hv),q);const a=oa*v*(1-o.vf)*(q.z>0?.72+.28*(1-q.z/U):1)*(.58+.42*o.hv),hw=o.vf<.98?chip(q.x,q.y,q.s*.8*(1+.9*o.hv),a,o.p,o.txt):0;if(hw&&o.hv>.05){g.save();g.globalAlpha=o.hv*.8;g.strokeStyle=o.p.col;g.lineWidth=1.5;g.beginPath();g.arc(q.x,q.y,hw+6+3*Math.sin(t*6),0,6.283);g.stroke();hoverCard(o,q,hw);g.restore()}if(v>.6&&o.vf<.6)hits.push({x:q.x,y:q.y,r:Math.max(14,hw),tip:o.p,txt:o.txt,go:()=>openProf(o.p)})}})})}
  if(blast_)rad.forEach(r=>{const q=P(r.x,r.y,r.z),a=Math.min(1,pt/.5)*(pt>.7?0:1);L.push({z:q.z,f:()=>{const hw=chip(q.x,q.y,Math.max(.7,q.s*.95),a,r.p);if(a>.4)hits.push({x:q.x,y:q.y,r:Math.max(14,hw),tip:r.p,go:()=>openProf(r.p)})}})});
  if(blast_)disp.forEach(r=>{const q=P(r.x,r.y,r.z),a=0;L.push({z:q.z,f:()=>{if(a>0)chip(q.x,q.y,q.s*.95*(.6+.4*a),a,r.o.p,r.o.txt)}})});
  L.sort((a,b)=>b.z-a.z);let done=false;const drawCore=()=>{done=true;(nucleusKind==='jarvis'?coreJarvis:nucleusKind==='ultron'?coreUltron:core3D)(O,R,cs,coreR)};
  L.forEach(it=>{if(!done&&it.z<0)drawCore();it.f()});if(!done)drawCore();if(!UL)layers(true,la);
  hits.reverse();orbCursor(O,coreR);
  // blast fx
  g.globalCompositeOperation='lighter';
  dust.forEach(d=>{const q=P(d.x,d.y,d.z);g.fillStyle=`hsla(${20+d.h*180},100%,70%,${Math.max(0,.8-pt/6)})`;g.fillRect(q.x,q.y,2*q.s,2*q.s)});
  ash.forEach(a=>{const q=P(a.x,a.y,a.z),u=a.age/a.life;g.globalAlpha=(1-u)*.9;g.fillStyle=u<.3?a.c:'#8b929c';g.fillRect(q.x,q.y,a.r*q.s*1.6,a.r*q.s*1.6)});g.globalAlpha=1;
  waves.forEach(w=>{if(w.t>0){const r=w.t*U*1.6;g.strokeStyle=`rgba(255,220,160,${Math.max(0,.9-w.t/2.2)})`;g.lineWidth=3+Math.min(4,pt*3);g.beginPath();g.arc(O.x,O.y,r,0,6.283);g.stroke()}});
  // radiation shockwave rings: continuous while charging, massive during the blast
  cwaves.forEach(w=>{if(w.t<0)return;const big=w.big,r=(big?U*.4:U*(.22+charge*.4))+w.t*(big?U*2.6:U*2.2),al=(1-w.t/(big?2.4:1.5))*(big?.55:.12+charge*.6);if(al<=0||r<=0)return;
    g.strokeStyle=`hsla(${hue()},100%,${big?82:74}%,${al})`;g.lineWidth=big?4:1.2+charge*2.2;g.beginPath();g.arc(O.x,O.y,r,0,6.283);g.stroke()});
  // explosion burst rays — strengthen as the blast proceeds
  if(blast_&&pt<1.4){const u=1-pt/1.4,cs2=1.3*(1-ease(Math.min(1,pt/.55))),RR=Math.max(2,coreR*cs2),nb=mobile?14:26;
    for(let i=0;i<nb;i++){const a=i/nb*6.283+Math.sin(i*99.7)*.25;const len=U*(.5+pt*3.4)*(.6+.4*Math.abs(Math.sin(i*5.1)));
      g.strokeStyle=`hsla(${hue()},100%,${75+20*u}%,${u*.75})`;g.lineWidth=1+u*2.4;g.beginPath();
      g.moveTo(O.x+Math.cos(a)*RR,O.y+Math.sin(a)*RR);g.lineTo(O.x+Math.cos(a)*(RR+len),O.y+Math.sin(a)*(RR+len));g.stroke()}}
  g.globalCompositeOperation='source-over';
  drawPlates();
  ripples.forEach(r=>{g.strokeStyle=col(.7*(1-r.t/.8));g.lineWidth=2;g.beginPath();g.arc(r.x,r.y,8+r.t*110,0,6.283);g.stroke()});
  if(flash>0){g.fillStyle=`rgba(255,245,225,${flash})`;g.fillRect(0,0,W,H)}
}
function ashFrom(x,y,z,c,n){for(let i=0;i<n;i++){const v=fib(Math.random()*300|0,300).map(q=>q*(.03+Math.random()*.1)*U);ash.push({x:x+(Math.random()-.5)*14,y:y+(Math.random()-.5)*14,z,vx:v[0],vy:v[1],vz:v[2],age:0,life:2.5+Math.random()*2.5,c,s:Math.random()*6.28,r:Math.random()*1.6+.8})}}
function orbCursor(O,cr){
  if(sa<.02||!fine||mobile)return;
  const x=pm.x,y=pm.y,e=.25+near*.75+charge*.6,rr=9+e*16;g.save();g.globalCompositeOperation='lighter';
  g.fillStyle=col(.22*sa,70);g.beginPath();g.arc(x,y,rr*1.5,0,6.283);g.fill();g.fillStyle=`hsla(${hue()},100%,88%,${.9*sa})`;g.beginPath();g.arc(x,y,rr*.45,0,6.283);g.fill();
  for(let i=0;i<5;i++){const a=t*(4+i*.8)+i*1.26,r2=rr*(.9+.3*Math.sin(t*3+i));g.fillStyle=col(.9*sa,80);g.fillRect(x+Math.cos(a)*r2-1,y+Math.sin(a)*r2*.55-1,2.4,2.4)}
  if(near>.05&&ph==='idle'){const dx=O.x-x,dy=O.y-y,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,n=1+Math.floor(near*4);g.strokeStyle=col((.3+near*.6)*sa,85);g.lineWidth=1+near*1.2;
    for(let i=0;i<n;i++){g.beginPath();g.moveTo(x,y);for(let j=1;j<=10;j++){const u=j/10,w=(Math.random()-.5)*46*Math.sin(u*3.14159)*(1-near*.4);g.lineTo(x+dx*u+nx*w,y+dy*u+ny*w)}g.stroke()}
    g.fillStyle=col(.95*sa,85);for(let i=0;i<8;i++){const u=(t*(.8+near)+i/8)%1;g.beginPath();g.arc(x+dx*u+nx*Math.sin(u*9+i)*8,y+dy*u+ny*Math.sin(u*9+i)*8,1.8,0,6.283);g.fill()}}
  for(let i=0;i<3+Math.floor(e*5);i++){const a=Math.random()*6.283,l=rr*(1.4+Math.random()*1.6);g.strokeStyle=`hsla(${hue()},100%,${80+Math.random()*15}%,${(.5+.4*Math.random())*sa})`;g.lineWidth=1+Math.random();g.beginPath();g.moveTo(x,y);for(let j=1;j<=5;j++){const u=j/5,d=(Math.random()-.5)*rr*.7;g.lineTo(x+Math.cos(a)*l*u-Math.sin(a)*d,y+Math.sin(a)*l*u+Math.cos(a)*d)}g.stroke()}
  if(ph==='blast'&&pt<.6){const u=Math.min(1,pt/.4),dx=x-O.x,dy=y-O.y;g.strokeStyle=`rgba(255,255,255,${.9*(1-pt/.6)})`;g.lineWidth=3;for(let i=0;i<3;i++){g.beginPath();g.moveTo(O.x,O.y);for(let j=1;j<=10;j++){const v=j/10*u,w=(Math.random()-.5)*40*Math.sin(v*3.14);g.lineTo(O.x+dx*v-dy*.002*w,O.y+dy*v+dx*.002*w)}g.stroke()}}
  g.globalCompositeOperation='source-over';const bh=(ph==='blast'||pm.hov)?1:Math.max(ss(.05,.3,near),Math.min(1,charge*8)),hr=rr*(.5+.25*e)*bh;if(bh>.02){g.fillStyle='#000';g.beginPath();g.arc(x,y,hr,0,6.283);g.fill();
  g.strokeStyle=col(.9*sa,78);g.lineWidth=2;g.beginPath();g.ellipse(x,y,hr*1.7,hr*.6,t*1.5,0,6.283);g.stroke();g.strokeStyle=col(.4*sa,70);g.lineWidth=1;g.beginPath();g.ellipse(x,y,hr*2.3,hr*.85,-t,0,6.283);g.stroke()}
  g.restore()}
function coreBeams(O,R,cs,rr){const TAU=6.283185,HX=rr,HY=rr,ex=O.x,ey=O.y;
  // lightning
  if(charge>.5&&cs>.5){const n=Math.floor((charge-.5)*(lite?6:12))+1;g.strokeStyle=col(.8,85);g.lineWidth=1.2;for(let i=0;i<n;i++){const v=fib(Math.random()*400|0,400),tgt=[v[0]*U*.7,v[1]*U*.7,v[2]*U*.7];g.beginPath();let q=P(0,0,0);g.moveTo(q.x,q.y);for(let j=1;j<=8;j++){const u=j/8;q=P(tgt[0]*u+(Math.random()-.5)*R*.5,tgt[1]*u+(Math.random()-.5)*R*.5,tgt[2]*u+(Math.random()-.5)*R*.5);g.lineTo(q.x,q.y)}g.stroke()}}
  if(near>.1&&cs>.5){const an=Math.atan2(pm.y-O.y,pm.x-O.x);g.strokeStyle=col(.8,85);g.lineWidth=1.5;for(let i=0;i<4;i++){const q=an+(Math.random()-.5)*1.1,l=R*(1.1+near*2.2*Math.random());g.beginPath();g.moveTo(O.x+Math.cos(q)*HX,O.y+Math.sin(q)*HY);g.lineTo(O.x+Math.cos(q)*(HX+l),O.y+Math.sin(q)*(HY+l));g.stroke()}}
  // radiation: micro-rings from the pupil, beams out of the shell, beams in from the cities
  for(let k=0;k<3;k++){const u=((t*.55+k/3)%1),rr2=R*(.24+u*1.1);g.strokeStyle=col((1-u)*(.10+.22*charge),74);g.lineWidth=1;g.beginPath();g.arc(ex,ey,rr2,0,TAU);g.stroke()}
  if(charge>0.04&&cs>.5){const nb=Math.floor(charge*(mobile?10:18))+2;for(let i=0;i<nb;i++){const a=i/nb*TAU+Math.floor(t*2.3)*.31,ca=Math.cos(a),sa2=Math.sin(a);const fl=.5+.5*Math.sin(t*15+i*2.7);const len=U*(.30+charge*.75)*(.6+.4*Math.sin(i*7.3+1));
    const sx=O.x+ca*HX*.95,sy=O.y+sa2*HY*.95;g.strokeStyle=col(charge*charge*.6*fl,82);g.lineWidth=.8+charge*1.8;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+ca*len,sy+sa2*len);g.stroke()}}
  if(charge>0.04&&cs>.5){const nb=Math.floor(charge*(mobile?6:10))+1;for(let i=0;i<nb;i++){const c=CITIES[(i*11+((t*2)|0))%CITIES.length];const cp=cityPt(c[0],c[1]);const u=(t*.85+i*.29)%1;
    const x=cp[0]+(O.x-cp[0])*u,y=cp[1]+(O.y-cp[1])*u,u0=Math.max(0,u-.08);
    g.strokeStyle=col(charge*charge*.22,78);g.lineWidth=1;g.beginPath();g.moveTo(cp[0]+(O.x-cp[0])*u0,cp[1]+(O.y-cp[1])*u0);g.lineTo(x,y);g.stroke();
    g.fillStyle=col(charge*charge*.7,85);g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill()}}
}

// ---- 3D nucleus: a lit sphere you can turn with the mouse, with a surface grid, panel dots, a tilted ring and
// charging effects. Electric pulses are drawn in from the corners while it charges or recharges. Every explosion gives it
// a new skin (sometimes black). About one explosion in four brings back the classic circular nucleus instead. ----
const SKINS=[
  {body:[205,70,38],hi:[190,100,82],rim:[195,100,68]},
  {body:[222,30,5],hi:[200,90,72],rim:[190,100,62],dark:1},
  {body:[28,85,40],hi:[42,100,84],rim:[34,100,64]},
  {body:[268,65,36],hi:[290,100,84],rim:[285,95,68]},
  {body:[150,70,28],hi:[160,100,78],rim:[150,100,58]},
  {body:[40,25,4],hi:[46,100,72],rim:[44,100,56],dark:1},
  {body:[350,75,36],hi:[8,100,80],rim:[355,100,64]},
  {body:[210,14,80],hi:[200,40,98],rim:[200,70,70]},
];
let skinI=0,nucleusKind='sphere',coreZoom=1,coreZoomT=1,needReset=false,absF=0,pulseAcc=0,pulses=[],cdrag=null;const coreRot={y:.6,x:.38,vy:.32};
const shd=(a,al,dl=0)=>`hsla(${a[0]},${a[1]}%,${Math.max(0,Math.min(100,a[2]+dl))}%,${Math.max(0,Math.min(1,al))})`;
const DOTS=fib&&Array.from({length:lite?150:300},(_,i)=>fib(i,lite?150:300));
const LDIR=(()=>{const x=-.45,y=-.5,z=.75,l=Math.hypot(x,y,z);return[x/l,y/l,z/l]})();
function rotP(x,y,z){const c1=Math.cos(coreRot.y),s1=Math.sin(coreRot.y),c2=Math.cos(coreRot.x),s2=Math.sin(coreRot.x);const x1=x*c1+z*s1,z1=-x*s1+z*c1;return[x1,y*c2-z1*s2,y*s2+z1*c2]}
let blastN=0,ultronAt=2+(Math.random()<.5?1:0);
function nextSkin(){let n=skinI;while(n===skinI)n=Math.floor(Math.random()*SKINS.length);skinI=n;blastN++;
  if(blastN>=ultronAt){nucleusKind='ultron';blastN=0;ultronAt=2+(Math.random()<.5?1:0)}else nucleusKind='sphere'}
// Photons: a few small energy packets. Some stream in from the edges and are absorbed, others leave the core and escape.
function spawnPulse(){if(pulses.length>12)return;
  if(Math.random()<.55){let x,y;if(Math.random()<.5){x=Math.random()<.5?-12:W+12;y=Math.random()<.5?-12:H+12}else{const e=Math.random()*4|0;x=e<2?Math.random()*W:(e===2?-12:W+12);y=e<2?(e===0?-12:H+12):Math.random()*H}
    pulses.push({x,y,a:0,in:1,u:0,sp:.3+Math.random()*.35})}
  else pulses.push({x:0,y:0,a:Math.random()*6.283,in:0,u:0,sp:.3+Math.random()*.4})}
function drawPulses(O,SK,cs){g.globalCompositeOperation='lighter';g.lineCap='round';
  for(const p of pulses){let hx,hy,ux,uy;
    if(p.in){const dx=O.x-p.x,dy=O.y-p.y,len=Math.hypot(dx,dy)||1;ux=dx/len;uy=dy/len;hx=p.x+dx*p.u;hy=p.y+dy*p.u}
    else{const D=Math.max(W,H)*.62,d=40+(D-40)*p.u;ux=Math.cos(p.a);uy=Math.sin(p.a);hx=O.x+ux*d;hy=O.y+uy*d}
    const al=cs*(p.in?Math.min(1,.25+p.u*1.2):Math.min(1,(1-p.u)*1.6)),L=34;
    const tg=g.createLinearGradient(hx-ux*L,hy-uy*L,hx,hy);tg.addColorStop(0,shd(SK.rim,0));tg.addColorStop(1,shd(SK.hi,.75*al));
    g.strokeStyle=tg;g.lineWidth=1.2;g.beginPath();g.moveTo(hx-ux*L,hy-uy*L);g.lineTo(hx,hy);g.stroke();
    const hg=g.createRadialGradient(hx,hy,0,hx,hy,7);hg.addColorStop(0,`rgba(255,255,255,${.95*al})`);hg.addColorStop(.35,shd(SK.rim,.55*al));hg.addColorStop(1,shd(SK.rim,0));g.fillStyle=hg;g.beginPath();g.arc(hx,hy,7,0,6.283);g.fill()}}
// ---- colour helpers: every colour below is designed in "display space". On a light page the canvas is flipped by a CSS filter,
// so lightness is mirrored here (sc) and additive glow becomes a normal tint. ----
const isLM=()=>!!(cfg.isLight&&cfg.isLight());
const sc=(h,s,l,a)=>`hsla(${h},${s}%,${isLM()?100-l:l}%,${Math.max(0,Math.min(1,a))})`;
const FLOW=Array.from({length:26},(_,i)=>{const f=fib(i,26);return{d:f,ph:Math.random(),sp:.5+Math.random()*.9,sd:Math.random()*100}});
// Electric charge flowing through the nucleus: bolts run from the centre out past the rim, packets travel outward AND inward,
// rings radiate out from the middle and others collapse back in. Everything gets denser and brighter as the charge builds.
function energyFlow(O,r,H,cs,ch,opaque){
  const LM=isLM(),TAU=6.283185,n=Math.min(FLOW.length,(lite?4:8)+Math.floor(ch*(lite?6:16)));
  const pass=(inside,clip)=>{
    g.save();
    if(clip){g.beginPath();if(inside)g.arc(O.x,O.y,r,0,TAU);else{g.rect(0,0,W,H);g.arc(O.x,O.y,r,0,TAU)}g.clip(inside?undefined:'evenodd')}
    g.globalCompositeOperation=LM?'source-over':'lighter';g.lineCap='round';g.lineJoin='round';
    const Lb=LM?(opaque&&inside?88:40):84,Lc=LM?(opaque&&inside?97:26):96;
    for(let i=0;i<n;i++){const b=FLOW[i],p=rotP(b.d[0],b.d[1],b.d[2]);
      const reach=r*(1.3+ch*.9+.15*Math.sin(t*2+b.sd)),dx=p[0],dy=p[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,k=Math.min(1,len*1.6+.25);
      const fl=.5+.5*Math.sin(t*(4+ch*8)+b.sd*3),al=(.1+ch*.42)*cs*(.45+.55*fl);
      g.strokeStyle=sc(H,95,Lb,al);g.lineWidth=1+ch*1.3;g.beginPath();
      for(let j=0;j<=9;j++){const u=j/9,jit=(Math.random()-.5)*r*.08*(1+ch*1.5)*Math.sin(u*3.1416),X=O.x+dx*reach*u*k+nx*jit,Y=O.y+dy*reach*u*k+ny*jit;j?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke();
      // charge packets: even ones travel out, odd ones travel in
      const u=(t*b.sp*(.35+ch*1.1)+b.ph)%1,pos=(i%2===0)?u:1-u,X=O.x+dx*reach*pos*k,Y=O.y+dy*reach*pos*k,pa=Math.sin(u*3.1416)*(.5+ch*.5)*cs;
      g.fillStyle=sc(H,95,Lb,pa*.35);g.beginPath();g.arc(X,Y,5+ch*5,0,TAU);g.fill();g.fillStyle=sc(H,70,Lc,pa);g.beginPath();g.arc(X,Y,1.6+ch*1.6,0,TAU);g.fill()}
    // rings: radiating out from the centre, and (once charging) collapsing back in
    for(let k=0;k<3;k++){const ph=(t*(.28+ch*1.3)+k/3)%1,rr=r*(.08+ph*(1.55+ch*.5)),al=(1-ph)*(.1+ch*.5)*cs*Math.min(1,ph*6);g.strokeStyle=sc(H,95,Lb,al);g.lineWidth=1+ch*2*(1-ph);g.beginPath();g.arc(O.x,O.y,rr,0,TAU);g.stroke()}
    if(ch>.12)for(let k=0;k<2;k++){const ph=(t*(.4+ch*1.4)+k/2)%1,rr=r*(2.1-ph*1.9),al=Math.sin(ph*3.1416)*(ch*.55)*cs;g.strokeStyle=sc(H,95,Lb,al);g.lineWidth=1+ch*1.6;g.beginPath();g.arc(O.x,O.y,rr,0,TAU);g.stroke()}
    g.restore()};
  if(LM&&opaque){pass(true,true);pass(false,true)}else pass(true,false);
}
function core3D(O,R,cs,coreR){
  if(R<1)return;const SK=SKINS[skinI],TAU=6.283185,r=R*1.7*coreZoom,dk=!!SK.dark,ch=charge,LM=isLM(),H=SK.rim[0],b0=SK.body,bL=b0[2];
  g.save();drawPulses(O,SK,cs);
  // halo
  g.globalCompositeOperation='lighter';const gr=r*(2.5+ch*1.4+absF*.8),gl=g.createRadialGradient(O.x,O.y,r*.85,O.x,O.y,gr);
  const hk=LM?.5:1;gl.addColorStop(0,shd(SK.rim,(.22+ch*.5+absF*.25)*cs*hk));gl.addColorStop(.5,shd(SK.rim,(.05+ch*.16)*cs*hk));gl.addColorStop(1,shd(SK.rim,0));g.fillStyle=gl;g.beginPath();g.arc(O.x,O.y,gr,0,TAU);g.fill();
  // tilted ring, back half
  const ringPts=[];for(let i=0;i<=72;i++){const a=i/72*TAU;let x=Math.cos(a)*1.7,y=0,z=Math.sin(a)*1.7;const ct=Math.cos(.5),st=Math.sin(.5);ringPts.push(rotP(x,y*ct-z*st,y*st+z*ct))}
  const drawRing=(front)=>{g.globalCompositeOperation='source-over';g.lineWidth=front?2.2:1.5;for(let i=0;i<72;i++){const a=ringPts[i],b=ringPts[i+1];if((a[2]+b[2]>0)!==front)continue;g.strokeStyle=sc(H,90,LM?42:72,(front?.9:.35)*cs*(.65+ch*.35));g.beginPath();g.moveTo(O.x+a[0]*r,O.y+a[1]*r);g.lineTo(O.x+b[0]*r,O.y+b[1]*r);g.stroke()}
    const a2=t*1.3,x=Math.cos(a2)*1.7,z=Math.sin(a2)*1.7,ct=Math.cos(.5),st=Math.sin(.5),q=rotP(x,-z*st,z*ct);if((q[2]>0)===front){g.fillStyle=sc(0,0,LM?20:100,.95*cs);g.beginPath();g.arc(O.x+q[0]*r,O.y+q[1]*r,2.6+front,0,TAU);g.fill()}};
  drawRing(false);
  // body: very dark in the middle, lighter towards the sides
  g.globalCompositeOperation='source-over';g.save();g.beginPath();g.arc(O.x,O.y,r,0,TAU);g.clip();
  const bg=g.createRadialGradient(O.x-r*.1,O.y-r*.12,0,O.x,O.y,r*1.02);
  if(dk){bg.addColorStop(0,sc(b0[0],40,1.5,cs));bg.addColorStop(.62,sc(b0[0],b0[1],5,cs));bg.addColorStop(.9,sc(SK.rim[0],70,LM?22:24,cs));bg.addColorStop(1,sc(SK.rim[0],90,LM?40:46,cs))}
  else{bg.addColorStop(0,sc(b0[0],b0[1],Math.max(2,bL*.07),cs));bg.addColorStop(.42,sc(b0[0],b0[1],bL*.26,cs));bg.addColorStop(.78,sc(b0[0],b0[1]+10,Math.min(66,bL*.9+6),cs));bg.addColorStop(.94,sc(SK.rim[0],95,LM?50:62,cs));bg.addColorStop(1,sc(SK.rim[0],100,LM?44:78,cs))}
  g.fillStyle=bg;g.fillRect(O.x-r,O.y-r,r*2,r*2);
  // charge: the centre goes white-hot and the brightness spreads outwards
  const gw=r*(.14+ch*1.05+absF*.5),ig=g.createRadialGradient(O.x,O.y,0,O.x,O.y,gw);
  ig.addColorStop(0,sc(SK.hi[0],55,97,Math.min(1,.14+ch*1.1)*cs));ig.addColorStop(.4,sc(SK.hi[0],95,78,(.08+ch*.65)*cs));ig.addColorStop(1,sc(SK.hi[0],95,60,0));g.fillStyle=ig;g.fillRect(O.x-r,O.y-r,r*2,r*2);
  // surface grid
  g.lineWidth=1;g.strokeStyle=sc(SK.hi[0],85,LM?58:76,((dk?.3:.22)+ch*.35+absF*.2)*cs);
  const run=(f)=>{g.beginPath();let pen=false;for(let k=0;k<=40;k++){const p=f(k/40);if(p[2]>-.02){const X=O.x+p[0]*r,Y=O.y+p[1]*r;if(pen)g.lineTo(X,Y);else{g.moveTo(X,Y);pen=true}}else pen=false}g.stroke()};
  for(let m=0;m<8;m++){const lon=m/8*3.1416,cl=Math.cos(lon),sl=Math.sin(lon);run(u=>{const a=u*TAU;return rotP(Math.cos(a)*cl,Math.sin(a),Math.cos(a)*sl)})}
  for(const la of [-.95,-.55,-.2,.2,.55,.95]){const cy=Math.cos(la),sy=Math.sin(la);run(u=>{const a=u*TAU;return rotP(cy*Math.cos(a),sy,cy*Math.sin(a))})}
  // panel dots: brighter towards the limb
  for(const d of DOTS){const p=rotP(d[0],d[1],d[2]);if(p[2]<=0)continue;const limb=1-p[2],li=Math.max(0,p[0]*LDIR[0]+p[1]*LDIR[1]+p[2]*LDIR[2]),al=(.1+.4*limb+.3*li+ch*.3+absF*.25)*cs;if(al<.03)continue;g.fillStyle=sc(SK.hi[0],85,LM?62:84,al);const sz=1+1.3*p[2];g.fillRect(O.x+p[0]*r-sz/2,O.y+p[1]*r-sz/2,sz,sz)}
  // veins of energy across the surface
  if(ch>.3&&cs>.4){const n=Math.floor(ch*(lite?3:6))+1;g.strokeStyle=sc(SK.hi[0],90,90,.85*cs);g.lineWidth=1.2;for(let i=0;i<n;i++){const a=DOTS[Math.random()*DOTS.length|0],b=DOTS[Math.random()*DOTS.length|0];g.beginPath();for(let j=0;j<=10;j++){const u=j/10;let x=a[0]*(1-u)+b[0]*u,y=a[1]*(1-u)+b[1]*u,z=a[2]*(1-u)+b[2]*u;const l=Math.hypot(x,y,z)||1;const p=rotP(x/l,y/l,z/l);const X=O.x+(p[0]+(Math.random()-.5)*.06)*r,Y=O.y+(p[1]+(Math.random()-.5)*.06)*r;if(j)g.lineTo(X,Y);else g.moveTo(X,Y)}g.stroke()}}
  if(absF>.02){g.fillStyle=sc(SK.rim[0],95,80,Math.min(.5,absF*.3)*cs);g.fillRect(O.x-r,O.y-r,r*2,r*2)}
  // specular highlight
  const sg=g.createRadialGradient(O.x-r*.38,O.y-r*.44,0,O.x-r*.38,O.y-r*.44,r*.3);sg.addColorStop(0,sc(0,0,100,(dk?.4:.5)*cs));sg.addColorStop(1,sc(0,0,100,0));g.fillStyle=sg;g.fillRect(O.x-r,O.y-r,r*2,r*2);
  g.restore();
  // crisp bright limb
  g.strokeStyle=sc(SK.rim[0],95,LM?44:78,(.85+absF*.15)*cs);g.lineWidth=1.6+ch*1.8;g.beginPath();g.arc(O.x,O.y,r,0,TAU);g.stroke();
  energyFlow(O,r,H,cs,ch,true);
  drawRing(true);
  g.globalCompositeOperation='lighter';coreBeams(O,R,cs,r*1.1);chargeBloom(O,SK,cs);
  g.restore()}

// ---- Ultron-style nucleus: a translucent, irregular crystal shell of glowing facets, filaments crackling through the inside,
// plasma ribbons arcing around it and sparks drifting off. Same charging behaviour as the sphere. Turn it with the mouse. ----
let UM=null;
function ultronMesh(){if(UM)return UM;const q=(1+Math.sqrt(5))/2;
  let V=[[-1,q,0],[1,q,0],[-1,-q,0],[1,-q,0],[0,-1,q],[0,1,q],[0,-1,-q],[0,1,-q],[q,0,-1],[q,0,1],[-q,0,-1],[-q,0,1]].map(v=>{const l=Math.hypot(v[0],v[1],v[2]);return[v[0]/l,v[1]/l,v[2]/l]});
  let F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  for(let s=0;s<(lite?1:2);s++){const mid=new Map(),nf=[];const gm=(a,b)=>{const k=a<b?a+'_'+b:b+'_'+a;if(mid.has(k))return mid.get(k);const m=[(V[a][0]+V[b][0])/2,(V[a][1]+V[b][1])/2,(V[a][2]+V[b][2])/2],l=Math.hypot(m[0],m[1],m[2]);V.push([m[0]/l,m[1]/l,m[2]/l]);mid.set(k,V.length-1);return V.length-1};
    F.forEach(([a,b,c])=>{const ab=gm(a,b),bc=gm(b,c),ca=gm(c,a);nf.push([a,ab,ca],[b,bc,ab],[c,ca,bc],[ab,bc,ca])});F=nf}
  const E=[],seen=new Set();F.forEach(f=>{for(let i=0;i<3;i++){const a=f[i],b=f[(i+1)%3],k=a<b?a*9999+b:b*9999+a;if(!seen.has(k)){seen.add(k);E.push([a,b,Math.random()*100])}}});
  const n=V.length;UM={V,F,E,n,rj:V.map(()=>Math.random()),pd:V.map(()=>[Math.random()*6.28,Math.random()*6.28,Math.random()*6.28]),X:new Float32Array(n),Y:new Float32Array(n),Z:new Float32Array(n),
    wisps:Array.from({length:7},()=>{const a=[Math.random()-.5,Math.random()-.5,Math.random()-.5],l=Math.hypot(a[0],a[1],a[2])||1,ax=[a[0]/l,a[1]/l,a[2]/l],h=Math.abs(ax[0])<.8?[1,0,0]:[0,1,0],u=[ax[1]*h[2]-ax[2]*h[1],ax[2]*h[0]-ax[0]*h[2],ax[0]*h[1]-ax[1]*h[0]],ul=Math.hypot(u[0],u[1],u[2]),uu=[u[0]/ul,u[1]/ul,u[2]/ul],vv=[ax[1]*uu[2]-ax[2]*uu[1],ax[2]*uu[0]-ax[0]*uu[2],ax[0]*uu[1]-ax[1]*uu[0]];return{u:uu,v:vv,a0:Math.random()*6.28,sp:(Math.random()<.5?-1:1)*(.4+Math.random()*.7),rad:1.18+Math.random()*.55,len:.45+Math.random()*.35,sd:Math.random()*50}}),
    sparks:Array.from({length:lite?30:70},(_,i)=>({d:fib(i,lite?30:70),ph:Math.random(),sp:.08+Math.random()*.2,rr:Math.random()}))};return UM}
function coreUltron(O,R,cs0,coreR){
  // Pure Ultron plasma crystal: an irregular, cracked-glass blob of glowing shards with a white-hot centre and electric filaments.
  // Nothing orbits it. It charges like the sphere (centre first, then outward), and on discharge the shards fly apart and vanish.
  const bl=ph==='blast',cs=bl?Math.max(0,1-pt/.75):cs0;
  if(cs<=.003||(R<1&&!bl))return;
  const M=ultronMesh(),SK=SKINS[skinI],ch=charge,LM=isLM(),TAU=6.283185,H=196,CM=LM?'source-over':'lighter',T=(d,l)=>LM?l:d;
  const r=(bl?coreR*2.25*(1+pt*3.4):R*2.25)*coreZoom,spread=bl?pt:0;
  g.save();drawPulses(O,SK,cs);
  // soft glow, no rings
  g.globalCompositeOperation='lighter';const gr=r*(2.2+ch*1.6+absF*.8),gl=g.createRadialGradient(O.x,O.y,r*.4,O.x,O.y,gr),hk=LM?.45:1;
  gl.addColorStop(0,`hsla(${H},100%,60%,${(.22+ch*.5+absF*.25)*cs*hk})`);gl.addColorStop(.45,`hsla(${H},100%,50%,${(.06+ch*.18)*cs*hk})`);gl.addColorStop(1,`hsla(${H},100%,50%,0)`);g.fillStyle=gl;g.beginPath();g.arc(O.x,O.y,gr,0,TAU);g.fill();
  // irregular vertex field: big uneven lobes plus per-vertex roughness, writhing slowly
  const {X,Y,Z}=M;for(let i=0;i<M.n;i++){const v=M.V[i],pd=M.pd[i],
    d=1+.34*(Math.sin(v[0]*2.1+t*.5+pd[0])*Math.sin(v[1]*1.9-t*.4+pd[1])+.6*Math.sin(v[2]*2.6+t*.6+pd[2]))+M.rj[i]*.12-.06+ch*.04*Math.sin(t*24+i*1.7),
    p=rotP(v[0]*d*(1+spread*.4*Math.sin(i)),v[1]*d,v[2]*d);X[i]=O.x+p[0]*r;Y[i]=O.y+p[1]*r;Z[i]=p[2]}
  // dark glassy body so the bright edges read against it
  g.globalCompositeOperation='source-over';
  M.F.forEach((f,fi)=>{if((Z[f[0]]+Z[f[1]]+Z[f[2]])/3>0)return;g.fillStyle=sc(H,75,5,.5*cs);g.beginPath();g.moveTo(X[f[0]],Y[f[0]]);g.lineTo(X[f[1]],Y[f[1]]);g.lineTo(X[f[2]],Y[f[2]]);g.closePath();g.fill()});
  const faces=(front)=>{g.globalCompositeOperation=CM;M.F.forEach((f,fi)=>{const z=(Z[f[0]]+Z[f[1]]+Z[f[2]])/3;if((z>0)!==front)return;const st=Math.pow(.5+.5*Math.sin(fi*12.9),2),fl=.5+.5*Math.sin(t*2.6+fi*1.7),a=((front?.07:.04)+.3*st*(.5+.5*fl)+ch*.14*st)*cs;
    g.fillStyle=`hsla(${H},${LM?85:92}%,${LM?100-T(0,38):56}%,${a*(LM?1.6:1)})`;g.beginPath();g.moveTo(X[f[0]],Y[f[0]]);g.lineTo(X[f[1]],Y[f[1]]);g.lineTo(X[f[2]],Y[f[2]]);g.closePath();g.fill()})};
  faces(false);
  // white-hot centre, spreading outward as the charge builds
  const gw=r*(.45+ch*1.0+absF*.4),ig=g.createRadialGradient(O.x,O.y,0,O.x,O.y,gw);
  ig.addColorStop(0,sc(H,30,LM?20:100,Math.min(1,.7+ch*.4)*cs));ig.addColorStop(.25,sc(H,95,LM?38:78,(.45+ch*.5)*cs));ig.addColorStop(1,sc(H,100,LM?50:52,0));
  g.globalCompositeOperation=CM;g.fillStyle=ig;g.beginPath();g.arc(O.x,O.y,gw,0,TAU);g.fill();
  // small flickering hot spots deep inside
  const tb=Math.floor(t*14),rn=(a)=>{const x=Math.sin(a*127.1+tb*311.7)*43758.5453;return x-Math.floor(x)};
  for(let k=0;k<6;k++){const a=rn(k*29+3)*TAU,d=rn(k*31+7)*.55*r,hx=O.x+Math.cos(a)*d,hy=O.y+Math.sin(a)*d,hr=r*(.05+.1*rn(k*37+1)),hg=g.createRadialGradient(hx,hy,0,hx,hy,hr);
    hg.addColorStop(0,sc(H,30,LM?18:100,(.5+.4*rn(k*41+2))*cs));hg.addColorStop(1,sc(H,95,LM?45:60,0));g.fillStyle=hg;g.beginPath();g.arc(hx,hy,hr,0,TAU);g.fill()}
  // filaments crackling inside, vertex to vertex, many more as it charges
  const nb=(lite?20:44)+Math.floor(ch*(lite?14:44));g.lineCap='round';g.lineJoin='round';
  for(let pass=0;pass<2;pass++){g.strokeStyle=sc(H,pass?30:95,pass?(LM?22:98):(LM?42:78),(pass?.8:.4)*cs);g.lineWidth=pass?1:1.5;g.beginPath();
    for(let i=pass;i<nb;i+=2){const a=(rn(i*3)*M.n)|0,b=(rn(i*3+1)*M.n)|0,N=6;
      for(let j=0;j<=N;j++){const u=j/N,sn=Math.sin(u*3.1416),x=X[a]*(1-u)+X[b]*u+sn*r*.14*(rn(i*7+j)-.5)*2,y=Y[a]*(1-u)+Y[b]*u+sn*r*.14*(rn(i*5+j)-.5)*2;j?g.lineTo(x,y):g.moveTo(x,y)}}
    g.stroke()}
  faces(true);
  // glowing shard edges: faint, normal, and flashing
  const e0=new Path2D(),e1=new Path2D(),e2=new Path2D();M.E.forEach(e=>{const fl=Math.sin(t*(2.5+ch*4)+e[2]*3),zz=(Z[e[0]]+Z[e[1]])/2,p=fl>.82?e2:(fl>-.15?e1:e0),zb=zz<0?e0:p;zb.moveTo(X[e[0]],Y[e[0]]);zb.lineTo(X[e[1]],Y[e[1]])});
  g.globalCompositeOperation=CM;
  g.strokeStyle=sc(H,100,T(60,46),(.07+ch*.08)*cs);g.lineWidth=6;g.stroke(e1);g.stroke(e2);
  g.strokeStyle=sc(H,95,T(62,46),(.34+ch*.2)*cs);g.lineWidth=.9;g.stroke(e0);
  g.strokeStyle=sc(H,95,T(74,40),(.75+ch*.25)*cs);g.lineWidth=1.3;g.stroke(e1);
  g.strokeStyle=sc(H,40,T(98,30),cs);g.lineWidth=2+ch;g.stroke(e2);
  // electric tendrils leaping off the surface (they flicker in place; nothing circles the crystal)
  const nt=(lite?7:14)+Math.floor(ch*(lite?8:26));g.lineWidth=1;
  for(let i=0;i<nt;i++){const a=(rn(i*11+5)*M.n)|0,dx=X[a]-O.x,dy=Y[a]-O.y,dl=Math.hypot(dx,dy)||1,ux=dx/dl,uy=dy/dl,len=r*(.25+rn(i*13+2)*.8)*(1+ch*.6),N=7;
    g.strokeStyle=sc(H,85,T(84,40),(.2+.55*rn(i*17+4))*cs);g.beginPath();let x=X[a],y=Y[a];g.moveTo(x,y);
    for(let j=1;j<=N;j++){const u=j/N,jt=(rn(i*19+j)-.5)*r*.16;x=X[a]+ux*len*u-uy*jt;y=Y[a]+uy*len*u+ux*jt;g.lineTo(x,y)}g.stroke();
    g.fillStyle=sc(H,40,T(97,28),.8*cs);g.beginPath();g.arc(x,y,1.2+ch,0,TAU);g.fill()}
  // sparks drifting straight out
  M.sparks.forEach(s=>{const u=(t*s.sp*(1+ch*2)+s.ph)%1,rr=1.05+u*(.9+s.rr*.8),p=rotP(s.d[0]*rr,s.d[1]*rr,s.d[2]*rr),al=(1-u)*Math.min(1,u*8)*(.5+ch*.4)*cs;g.fillStyle=sc(H,80,T(88,36),al);const sz=1+1.4*(1-u);g.fillRect(O.x+p[0]*r-sz/2,O.y+p[1]*r-sz/2,sz,sz)});
  if(!bl)energyFlow(O,r,H,cs,ch,false);
  g.globalCompositeOperation='lighter';coreBeams(O,R,cs,r*1.1);chargeBloom(O,SK,cs);
  g.restore()}

// screen-wide bloom that grows with the charge: the whole scene gets brighter as the core fills
function chargeBloom(O,SK,cs){const ch=charge;if(ch<.04)return;g.globalCompositeOperation='lighter';const rr=Math.max(W,H)*(.45+ch*.5),b=g.createRadialGradient(O.x,O.y,0,O.x,O.y,rr);b.addColorStop(0,shd(SK.hi,ch*ch*.34*cs));b.addColorStop(.35,shd(SK.rim,ch*ch*.14*cs));b.addColorStop(1,shd(SK.rim,0));g.fillStyle=b;g.fillRect(0,0,W,H)}
// ---- Jarvis-style nucleus: concentric rotating HUD rings with tick marks, scanning arcs and a pulsing core. Tilts with the mouse. ----
function coreJarvis(O,R,cs,coreR){
  if(R<1)return;const SK=SKINS[skinI],TAU=6.283185,ch=charge,r=R*1.5*coreZoom;
  g.save();drawPulses(O,SK,cs);g.globalCompositeOperation='lighter';
  const gr=r*(3.4+ch*1.6+absF*.8),gl=g.createRadialGradient(O.x,O.y,r*.3,O.x,O.y,gr);
  gl.addColorStop(0,shd(SK.rim,(.34+ch*.55+absF*.25)*cs));gl.addColorStop(.45,shd(SK.rim,(.07+ch*.18)*cs));gl.addColorStop(1,shd(SK.rim,0));g.fillStyle=gl;g.beginPath();g.arc(O.x,O.y,gr,0,TAU);g.fill();
  const tilt=Math.max(.3,Math.cos(coreRot.x*1.1)),sp=1+ch*3.2,A=(.55+ch*.45+absF*.2)*cs,spin=coreRot.y*.6;
  g.translate(O.x,O.y);g.scale(1,tilt);g.lineCap='round';
  const circ=(rad,w,al,dash)=>{g.lineWidth=w;g.strokeStyle=shd(SK.rim,al);g.setLineDash(dash||[]);g.beginPath();g.arc(0,0,rad,0,TAU);g.stroke();g.setLineDash([])};
  const arcs=(rad,w,al,n,len,off,col)=>{g.lineWidth=w;g.strokeStyle=shd(col||SK.hi,al);for(let i=0;i<n;i++){const a=off+i/n*TAU;g.beginPath();g.arc(0,0,rad,a,a+len);g.stroke()}};
  const ticks=(rad,n,l1,l2,al,off,every)=>{g.lineWidth=1;g.strokeStyle=shd(SK.rim,al);g.beginPath();for(let i=0;i<n;i++){const a=off+i/n*TAU,l=i%every===0?l2:l1,c=Math.cos(a),s2=Math.sin(a);g.moveTo(c*rad,s2*rad);g.lineTo(c*(rad+l),s2*(rad+l))}g.stroke()};
  // rings, inside out
  ticks(r*1.02,72,r*.04,r*.09,.5*A,t*.25*sp+spin,6);
  circ(r*1.0,1.6,.8*A);
  arcs(r*1.22,3.2+ch*2,.9*A,3,1.7+ch*.4,-t*.7*sp+spin,SK.hi);
  circ(r*1.22,.8,.3*A);
  circ(r*1.5,1.1,.55*A,[r*.07,r*.05]);
  arcs(r*1.5,1.6,.7*A,2,2.4,t*.45*sp-spin,SK.rim);
  arcs(r*1.82,4,.85*A,4,.42+ch*.3,t*.35*sp+spin*.5,SK.hi);
  circ(r*1.82,.8,.3*A);
  ticks(r*2.15,120,r*.035,r*.1,.45*A,-t*.12*sp-spin,10);
  circ(r*2.15,1,.4*A);
  // scanning sweep
  const sw=t*1.4*sp;for(let k=0;k<16;k++){const a=sw-k*.06;g.strokeStyle=shd(SK.hi,(1-k/16)*.5*A);g.lineWidth=2;g.beginPath();g.moveTo(Math.cos(a)*r*.62,Math.sin(a)*r*.62);g.lineTo(Math.cos(a)*r*1.22,Math.sin(a)*r*1.22);g.stroke()}
  // inner hexagons and crosshair
  for(let h=0;h<2;h++){const rad=r*(.5-h*.14),dir=h?-1:1;g.strokeStyle=shd(SK.hi,(.75-h*.2)*A);g.lineWidth=1.3;g.beginPath();for(let i=0;i<=6;i++){const a=i/6*TAU+t*.5*dir*sp+spin;i?g.lineTo(Math.cos(a)*rad,Math.sin(a)*rad):g.moveTo(Math.cos(a)*rad,Math.sin(a)*rad)}g.stroke()}
  g.strokeStyle=shd(SK.rim,.35*A);g.lineWidth=1;g.beginPath();g.moveTo(-r*2.3,0);g.lineTo(-r*.7,0);g.moveTo(r*.7,0);g.lineTo(r*2.3,0);g.moveTo(0,-r*2.3);g.lineTo(0,-r*.7);g.moveTo(0,r*.7);g.lineTo(0,r*2.3);g.stroke();
  // electric arcs between rings while charging
  if(ch>.25&&cs>.4){const n=Math.floor(ch*(lite?3:7));g.strokeStyle=shd(SK.hi,.9*cs);g.lineWidth=1.2;for(let i=0;i<n;i++){const a=Math.random()*TAU,x0=Math.cos(a)*r*.5,y0=Math.sin(a)*r*.5,x1=Math.cos(a+(Math.random()-.5)*.8)*r*1.8,y1=Math.sin(a+(Math.random()-.5)*.8)*r*1.8;g.beginPath();g.moveTo(x0,y0);for(let j=1;j<=6;j++){const u=j/6;g.lineTo(x0+(x1-x0)*u+(Math.random()-.5)*r*.18,y0+(y1-y0)*u+(Math.random()-.5)*r*.18)}g.stroke()}}
  // bright pulsing core
  const pu=1+.1*Math.sin(t*3*(1+ch*3)),cr=r*.34*pu,cg=g.createRadialGradient(0,0,0,0,0,cr*2);cg.addColorStop(0,`rgba(255,255,255,${Math.min(1,.9+ch*.1)*cs})`);cg.addColorStop(.25,shd(SK.hi,(.9)*cs));cg.addColorStop(.6,shd(SK.rim,(.4+ch*.4)*cs));cg.addColorStop(1,shd(SK.rim,0));g.fillStyle=cg;g.beginPath();g.arc(0,0,cr*2,0,TAU);g.fill();
  g.restore();
  // HUD text, drawn unsquashed
  g.save();g.globalCompositeOperation='lighter';g.font='600 10px ui-monospace,Menlo,Consolas,monospace';g.textAlign='center';g.fillStyle=shd(SK.hi,.75*cs*(.6+ch*.4));
  g.fillText(`CHARGE ${Math.round(ch*100)}%`,O.x,O.y+r*2.15*tilt+22);g.fillText(ch>.95?'DISCHARGE':'SYNC ONLINE',O.x,O.y-r*2.15*tilt-14);
  g.textAlign='left';g.fillText(`NODES ${live.length}`,O.x+r*2.3+12,O.y+4);g.textAlign='right';g.fillText(`LINK ${(98+Math.round(Math.sin(t)*1.5))}%`,O.x-r*2.3-12,O.y+4);
  g.restore();
  g.save();g.globalCompositeOperation='lighter';coreBeams(O,R,cs,r*1.05);chargeBloom(O,SK,cs);g.restore()}
function core(O,R,cs,coreR){
  if(R<1)return;g.save();g.globalCompositeOperation='lighter';
  // The core is an oval, Ultron-style head: tall ellipse, curved plate seams, ribbed shell, a visor eye.
  const HX=R*2.1,HY=R*2.1,TAU=6.283185,PI=3.141593;
  const el=(x,y,rx,ry,a0,a1)=>{g.beginPath();g.ellipse(x,y,Math.max(.2,rx),Math.max(.2,ry),0,a0,a1);g.stroke()};
  const AX=R*(3.1+charge*.9)*(1+near*.25),AY=AX;
  g.fillStyle=col(.06+.05*charge,55);g.beginPath();g.ellipse(O.x,O.y,AX,AY,0,0,TAU);g.fill();
  g.strokeStyle=col(.4+.3*charge,72);g.lineWidth=1.3;el(O.x,O.y,AX,AY,0,TAU);g.strokeStyle=col(.18+.2*charge,72);el(O.x,O.y,AX*1.12,AY*1.12,0,TAU);
  // lightning
  if(charge>.5&&cs>.5){const n=Math.floor((charge-.5)*(lite?6:12))+1;g.strokeStyle=col(.8,85);g.lineWidth=1.2;for(let i=0;i<n;i++){const v=fib(Math.random()*400|0,400),tgt=[v[0]*U*.7,v[1]*U*.7,v[2]*U*.7];g.beginPath();let q=P(0,0,0);g.moveTo(q.x,q.y);for(let j=1;j<=8;j++){const u=j/8;q=P(tgt[0]*u+(Math.random()-.5)*R*.5,tgt[1]*u+(Math.random()-.5)*R*.5,tgt[2]*u+(Math.random()-.5)*R*.5);g.lineTo(q.x,q.y)}g.stroke()}}
  if(near>.1&&cs>.5){const an=Math.atan2(pm.y-O.y,pm.x-O.x);g.strokeStyle=col(.8,85);g.lineWidth=1.5;for(let i=0;i<4;i++){const q=an+(Math.random()-.5)*1.1,l=R*(1.1+near*2.2*Math.random());g.beginPath();g.moveTo(O.x+Math.cos(q)*HX,O.y+Math.sin(q)*HY);g.lineTo(O.x+Math.cos(q)*(HX+l),O.y+Math.sin(q)*(HY+l));g.stroke()}}
  const ex=O.x+eye.x*R*.18,ey=O.y-R*.14+eye.y*R*.14;
  // radiation: micro-rings from the pupil, beams out of the shell, beams in from the cities
  for(let k=0;k<3;k++){const u=((t*.55+k/3)%1),rr2=R*(.24+u*1.1);g.strokeStyle=col((1-u)*(.10+.22*charge),74);g.lineWidth=1;g.beginPath();g.arc(ex,ey,rr2,0,TAU);g.stroke()}
  if(charge>0.04&&cs>.5){const nb=Math.floor(charge*(mobile?10:18))+2;for(let i=0;i<nb;i++){const a=i/nb*TAU+Math.floor(t*2.3)*.31,ca=Math.cos(a),sa2=Math.sin(a);const fl=.5+.5*Math.sin(t*15+i*2.7);const len=U*(.30+charge*.75)*(.6+.4*Math.sin(i*7.3+1));
    const sx=O.x+ca*HX*.95,sy=O.y+sa2*HY*.95;g.strokeStyle=col(charge*charge*.6*fl,82);g.lineWidth=.8+charge*1.8;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+ca*len,sy+sa2*len);g.stroke()}}
  if(charge>0.04&&cs>.5){const nb=Math.floor(charge*(mobile?6:10))+1;for(let i=0;i<nb;i++){const c=CITIES[(i*11+((t*2)|0))%CITIES.length];const cp=cityPt(c[0],c[1]);const u=(t*.85+i*.29)%1;
    const x=cp[0]+(O.x-cp[0])*u,y=cp[1]+(O.y-cp[1])*u,u0=Math.max(0,u-.08);
    g.strokeStyle=col(charge*charge*.22,78);g.lineWidth=1;g.beginPath();g.moveTo(cp[0]+(O.x-cp[0])*u0,cp[1]+(O.y-cp[1])*u0);g.lineTo(x,y);g.stroke();
    g.fillStyle=col(charge*charge*.7,85);g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill()}}
  {
    // ---- plasma crystal: folded translucent shells, crackling filaments from a bright centre, drifting sparks ----
    const cxp=ex,cyp=ey+R*.14,E=.8+charge*.9;
    for(let k=5;k>=0;k--){const faceted=k%2===0,N=faceted?9+k*2:64,rb=R*(1.0+k*.16)*2.2;
      const pts=[];for(let i=0;i<N;i++){const th=i/N*TAU+k*.9,r=rb*(1+.15*Math.sin(3*th+t*.5+k*1.7)+.09*Math.sin(5*th-t*.7+k*2.3)+.06*Math.sin(8*th+t*.9+k))*(1+.05*Math.sin(t*2+k)*E);pts.push([O.x+Math.cos(th)*r*.94,O.y+Math.sin(th)*r*1.04])}
      g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();
      g.fillStyle=col(.07+.012*(5-k)+charge*.04,60);g.fill();g.strokeStyle=col((.85-k*.08)+charge*.15,66+k*3);g.lineWidth=faceted?1.8:1.2;g.stroke();
      if(faceted){g.strokeStyle=col(.14+charge*.1,70);g.lineWidth=.8;g.beginPath();pts.forEach((q,i)=>{if(i%2===0){g.moveTo(q[0],q[1]);g.lineTo(cxp,cyp)}});g.stroke()}
      else{g.strokeStyle=col(.3,76);g.lineWidth=1;g.beginPath();pts.forEach((q,i)=>{if(i%5===0){const m=pts[(i+7)%N];g.moveTo(q[0],q[1]);g.quadraticCurveTo(O.x,O.y,m[0],m[1])}});g.stroke()}}
    // electric filaments
    const NF=Math.floor((mobile?18:34)*E);g.lineCap='round';
    for(let i=0;i<NF;i++){const a0=i*2.399+t*.05,len=R*(1.2+1.1*Math.abs(Math.sin(i*5.7)))*1.9,bright=.25+.55*Math.abs(Math.sin(t*(1.4+i%5*.3)+i*3.1));
      g.strokeStyle=col(bright*(.5+charge*.5),80);g.lineWidth=.7+(i%4===0?.9:0)+charge;g.beginPath();g.moveTo(cxp,cyp);
      let px=cxp,py=cyp;const dx=Math.cos(a0),dy=Math.sin(a0);
      for(let j=1;j<=7;j++){const u=j/7,w=Math.sin(t*3.3*(1+charge)+i*7.1+j*2.9)*R*.11*u;px=cxp+dx*len*u-dy*w;py=cyp+dy*len*u+dx*w;g.lineTo(px,py)}g.stroke();
      if(i%3===0){g.lineWidth=.6;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a0+.7)*R*.28,py+Math.sin(a0+.7)*R*.28);g.stroke()}}
    // sparks
    const NS_=mobile?40:90;for(let i=0;i<NS_;i++){const rr=R*(1.6+((i*37)%100)/100*1.9),ang=i*1.618*TAU+t*(.08+((i*13)%7)*.012)*(i%2?1:-1),tw=.3+.7*Math.abs(Math.sin(t*2+i));g.fillStyle=col(tw*.8,82);g.fillRect(O.x+Math.cos(ang)*rr*.95-1,O.y+Math.sin(ang)*rr*1.05-1,i%5===0?2.6:1.6,i%5===0?2.6:1.6)}
    // bright centre (stepped discs, no gradient)
    const pu=1+.12*Math.sin(t*3);[[.62,.05],[.42,.09],[.26,.16],[.15,.34]].forEach(([r,a])=>{g.fillStyle=col(a+charge*.1,78);g.beginPath();g.arc(cxp,cyp,R*r*pu,0,TAU);g.fill()});
    g.fillStyle=`rgba(255,255,255,${.95*cs})`;g.beginPath();g.arc(cxp,cyp,R*.07*pu,0,TAU);g.fill();
  }
  g.restore()}
// interaction

const lp=(e)=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
function pick(x,y){for(const h of hits)if(Math.hypot(h.x-x,h.y-y)<h.r)return h;return null}
function showTip(h,x,y){if(!h||(!h.tip&&!h.cat)){tip.style.opacity='0';return}const p=h.tip;
  if(h.cat)tip.innerHTML=`<b>${esc(h.cat[1])} ${esc(h.cat[0])}</b><i>${esc(h.cat[2])}</i><i>Click to explore</i>`;
  else tip.innerHTML=`<b>${esc(p.n)}</b> · ★ ${esc(p.rate)}<i>“${esc(h.txt||p.rv[0])}”</i><i>Sample review · click for profile</i>`;
  tip.style.opacity='1';tip.style.left=Math.min(x+16,W-250)+'px';tip.style.top=Math.max(8,y-10)+'px'}
cv.addEventListener('pointermove',e=>{const[x,y]=lp(e);pm.x=x;pm.y=y;pm.in=true;const h=pick(x,y);pm.h=h;cv.style.cursor=h?'pointer':(fine?'none':'default');showTip(h,x,y)});
cv.addEventListener('pointerdown',e=>{const[x,y]=lp(e);pm.x=x;pm.y=y;pm.in=true;if(pm.hov&&e.pointerType!=='touch'&&ph==='idle')cdrag={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,m:0};if(!pm.hov&&(!pm.h||pm.h.map))drag={x:e.clientX,y:e.clientY,lon:mapLon,lat:mapLat,lx:e.clientX,pt:performance.now(),m:0}});
const onWinMove=e=>{if(cdrag){const dx=e.clientX-cdrag.lx,dy=e.clientY-cdrag.ly;cdrag.lx=e.clientX;cdrag.ly=e.clientY;if(Math.hypot(e.clientX-cdrag.x,e.clientY-cdrag.y)>5)cdrag.m=1;if(cdrag.m){coreRot.y+=dx*.012;coreRot.x=Math.max(-1.3,Math.min(1.3,coreRot.x+dy*.012));coreRot.vy=Math.max(-8,Math.min(8,dx*.012*60))}return}if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)drag.m=1;if(!drag.m)return;
  mapLon=drag.lon-dx/ppd;mapLat=Math.max(-20,Math.min(62,drag.lat+dy/ppd));
  const now=performance.now(),dm=Math.max(8,now-drag.pt)/1000;mapVel=Math.max(-90,Math.min(90,mapVel*.6+(-(e.clientX-drag.lx)/ppd/dm)*.4));drag.lx=e.clientX;drag.pt=now},
onWinUp=()=>{if(cdrag){lastM=!!cdrag.m;cdrag=null;return}lastM=!!(drag&&drag.m);if(drag&&performance.now()-drag.pt>90)mapVel=0;drag=null};
addEventListener('pointermove',onWinMove);addEventListener('pointerup',onWinUp);
cv.addEventListener('wheel',e=>{if(pm.hov&&ph==='idle'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();coreZoomT=Math.max(.6,Math.min(2.4,coreZoomT*(e.deltaY<0?1.12:.89)))}},{passive:false});
cv.addEventListener('wheel',e=>{if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();zoomT=Math.max(1,Math.min(3,zoomT*Math.exp(-e.deltaY*.0025)))},{passive:false});
cv.addEventListener('pointerleave',()=>{pm.in=false;pm.h=null;tip.style.opacity='0'});
cv.addEventListener('pointercancel',()=>{pm.in=false;pm.h=null;drag=null});
cv.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')pm.in=false});
const coreAct=k=>{if(k==='single')blT=6;tip.style.opacity='0';cfg.onCore&&cfg.onCore(k)};
cv.addEventListener('click',e=>{const[x,y]=lp(e);if(!paused)ripples.push({x,y,t:0});if(lastM){lastM=false;return}const h=pick(x,y);if(h){h.go();return}if(ph!=='idle'||appear<.9)return;const O=P(0,0,0);
  if(Math.hypot(x-O.x,y-O.y)<.15*U*2.3){clearTimeout(clT);if(e.detail>=2)coreAct('double');else clT=setTimeout(()=>coreAct('single'),260)}else{clearTimeout(clT);if(e.detail>=2){paused=!paused;ripples=[];tip.style.opacity='0'}else if(!paused)clT=setTimeout(()=>spawn(x,y),260)}});
const openProf=(p)=>{tip.style.opacity='0';cfg.onProvider(p.slug)};
const openCat=(c)=>{tip.style.opacity='0';cfg.onCategory(c.slug)};
let last=performance.now(),raf=0,vis=true;
const io=new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis&&needReset){needReset=false;cyc++;hardReset()}if(away&&e[0].intersectionRatio>=.5)away=false;last=performance.now()},{threshold:[0,.5]});io.observe(cv);
// The core must never go dark: bad numbers or a thrown error are repaired on the spot instead of freezing the canvas.
let fails=0,warned=false;
function sane(){const n=[cur.px,cur.py,eye.x,eye.y,near,sa,yaw,dragYaw,dragPit,charge,appear,bt,pt,t,U,cx,cy,ox,oy,mult,spin,bl,blT,mapLon,mapLat,zoom,zoomT,mapVel,ppd];
  if(n.every(Number.isFinite))return false;
  cur.px=cur.py=cur.rx=cur.ry=0;eye.x=eye.y=0;near=0;sa=0;yaw=0;dragYaw=dragPit=0;ox=oy=0;charge=0;mult=1;spin=0;bl=0;blT=0;t=0;pt=0;
  mapLon=100;mapLat=26;zoom=zoomT=1;mapVel=0;ppd=8;rays=[];appear=1;bt=9;rs();return true}
function hardReset(){pulses=[];absF=0;cdrag=null;coreZoom=coreZoomT=1;ph='idle';pt=0;bt=9;appear=1;charge=0;mult=1;flash=0;veilA=0;away=false;sent=false;paused=false;drag=null;
  rad=[];disp=[];dust=[];ash=[];waves=[];cwaves=[];ripples=[];orb.forEach(o=>{o.vf=0;o.sp=undefined});
  cur.px=cur.py=0;eye.x=eye.y=0;near=0;sa=0;ox=oy=0;try{cv.width=cv.width}catch(_){}rs();emit(true)}
function fail(e){fails++;if(!warned){warned=true;console.error('[core] recovered from',e)}if(fails>=12){fails=0;hardReset()}else{try{cv.width=cv.width;rs()}catch(_){}}}
const loop=(now)=>{raf=requestAnimationFrame(loop);const dt=Math.max(0,Math.min(.05,(now-last)/1000))*(document.documentElement.dataset.calm==='1'?.25:1);last=now;if(!vis){document.documentElement.dataset.coreBusy='0';if(needReset){needReset=false;cyc++;hardReset()}return}
  let ok=true;try{update(dt)}catch(e){ok=false;fail(e)}
  try{sane();draw()}catch(e){ok=false;fail(e)}
  if(ok)fails=0};
raf=requestAnimationFrame(loop);
return{setNucleus(k){nucleusKind=k},zoomBy(f){zoomT=Math.max(1,Math.min(3,zoomT*f))},destroy(){document.documentElement.dataset.coreBusy='0';cancelAnimationFrame(raf);ro.disconnect();io.disconnect();removeEventListener('pointermove',onWinMove);removeEventListener('pointerup',onWinUp)}};
}