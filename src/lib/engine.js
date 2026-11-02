/** All gameplay is local, deterministic and independent of React/WebGL. */
export const SAVE_KEY='zidane.mining.operations.v1';
export const CONFIG_VERSION=1;
export const ROUTES=[
 {id:'bpn',city:'Smelter Balikpapan',code:'BPN',tons:120,time:42,reward:4500,description:'Rute dekat • untuk sungai yang relatif dangkal'},
 {id:'bnt',city:'Bontang Industrial Jetty',code:'BNT',tons:180,time:58,reward:7300,description:'Rute reguler • muatan sedang'},
 {id:'smd',city:'Samarinda Bulk Terminal',code:'SMD',tons:240,time:75,reward:10600,description:'Rute ekspor regional • muatan besar'},
 {id:'trk',city:'Tarakan Bulk Processing',code:'TRK',tons:300,time:94,reward:14800,description:'Rute jarak jauh • membutuhkan draft tinggi'},
];
export const UPGRADES={
 excavator:{name:'Excavator Fleet',desc:'Pengerukan otomatis +2,2 ton/detik',cost:3800,growth:1.65,max:5},
 bucket:{name:'Bucket-Wheel Miner',desc:'Produksi pasif +3,4 ton/detik',cost:8700,growth:1.7,max:3},
 truck:{name:'Haul Truck',desc:'Pemindahan pit → stockpile +2,4 ton/detik',cost:4100,growth:1.65,max:4},
 conveyor:{name:'Jetty Conveyor',desc:'Transfer stockpile → jetty +2,2 ton/detik',cost:4300,growth:1.72,max:5},
 loader:{name:'Ship Loader',desc:'Pemuatan tongkang +2,5 ton/detik',cost:5200,growth:1.72,max:4},
 storage:{name:'Stockpile Expansion',desc:'Kapasitas stockpile +160 ton',cost:7800,growth:1.9,max:3},
 berth:{name:'Jetty Berth Expansion',desc:'1 berth baru & jetty buffer +100 ton',cost:17200,growth:1.85,max:2},
};
const round=(x)=>Math.round((x+Number.EPSILON)*1000)/1000;
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const copy=x=>structuredClone(x);
export const berthCount=g=>1+g.levels.berth;
export const pitCap=()=>120;
export const stockCap=g=>360+g.levels.storage*160;
export const jettyCap=g=>220+g.levels.berth*100;
export const priceIndex=g=>round(.93+.17*Math.sin(g.clock/63));
export const riverDepth=g=>round(3.65+1.05*Math.sin(g.clock/68+1.15)-.20*Math.max(0,Math.sin(g.clock/42+2)));
export const safeTonnes=g=>clamp(Math.floor((riverDepth(g)-2)*120/10)*10,60,300);
export const weather=g=>Math.sin(g.clock/46+2)>.72?'Hujan lebat':Math.sin(g.clock/46+2)<-.7?'Kemarau':'Cerah berawan';
export const oeeRate=g=>Math.round((g.health/100)*(g.fuel/100)*100);
export const extractionRate=g=>(1.3+2.2*g.levels.excavator+3.4*g.levels.bucket)*(g.health>=25&&g.fuel>=15?1:.45);
export const haulRate=g=>2+2.4*g.levels.truck;
export const conveyorRate=g=>1.1+2.2*g.levels.conveyor;
export const loaderRate=g=>1.1+2.5*g.levels.loader;
export const upgradePrice=(g,key)=>UPGRADES[key]?Math.ceil(UPGRADES[key].cost*Math.pow(UPGRADES[key].growth,g.levels[key])):Infinity;
export const routeFor=id=>ROUTES.find(r=>r.id===id);
export const selectedBarge=g=>g.fleet.find(v=>v.id===g.selectedBarge)||g.fleet[0];
export const activeVoyages=g=>g.fleet.filter(b=>b.status==='sailing');
export const berthUsed=g=>g.fleet.filter(b=>['berthed','loading'].includes(b.status)).length;
export const freeBerth=g=>Array.from({length:berthCount(g)},(_,i)=>i+1).find(id=>!g.fleet.some(b=>b.berth===id && ['berthed','loading'].includes(b.status)))||null;
export const totalOre=g=>round(g.pit+g.stockpile+g.jetty+g.fleet.reduce((sum,b)=>sum+b.cargo,0));
export const fleetCost=g=>Math.ceil(12500*Math.pow(1.7,g.fleet.length-1));
const event=(g,message,type='info')=>{g.logs=[{id:g.serial++,clock:g.clock,message,type},...g.logs].slice(0,14);};
export function newGame(){
 return {version:CONFIG_VERSION,clock:0,speed:1,paused:false,theme:'light',quality:'eco',view:'3d',cash:36000,pit:40,stockpile:120,jetty:30,
 levels:{excavator:0,bucket:0,truck:0,conveyor:0,loader:0,storage:0,berth:0},health:92,fuel:88,
 conveyorOn:true,selectedBarge:'BG-001',fleet:[{id:'BG-001',name:'Mahakam Explorer',cap:300,status:'berthed',berth:1,cargo:0,routeId:null,remaining:0,totalTime:0,reward:0,departedCargo:0,loading:false}],
 stats:{shipped:0,voyages:0,revenue:0,manual:0,xp:0},serial:3,logs:[{id:2,clock:0,type:'success',message:'Shift tambang dimulai di Site Mahakam, Kalimantan Timur.'},{id:1,clock:0,type:'info',message:'Konveyor aktif. Pilih kontrak untuk memulai pemuatan tongkang.'}]};
}
export function manualMine(g){
 if(g.paused||g.pit>=pitCap())return g;
 const n=copy(g);const qty=round(Math.min(10,pitCap()-n.pit));n.pit=round(n.pit+qty);n.stats.manual=round(n.stats.manual+qty);return n;
}
export function toggleConveyor(g){if(g.paused)return g;return {...g,conveyorOn:!g.conveyorOn};}
export function selectBarge(g,id){if(!g.fleet.some(b=>b.id===id))return g;return {...g,selectedBarge:id};}
export function setMeta(g,key,value){
 if(key==='speed'&&[1,2,4].includes(value))return {...g,speed:value};
 if(key==='paused'&&typeof value==='boolean')return {...g,paused:value};
 if(key==='theme'&&['light','dark'].includes(value))return {...g,theme:value};
 if(key==='quality'&&['eco','normal'].includes(value))return {...g,quality:value};
 if(key==='view'&&['2d','3d'].includes(value))return {...g,view:value};
 return g;
}
export function buyUpgrade(g,key){const d=UPGRADES[key];if(g.paused||!d||g.levels[key]>=d.max||g.cash<upgradePrice(g,key))return g;
 const n=copy(g);n.cash-=upgradePrice(n,key);n.levels[key]++;event(n,`${d.name} naik ke level ${n.levels[key]}`,'upgrade');return n;
}
export function buyBarge(g){if(g.paused||g.fleet.length>=3||g.cash<fleetCost(g))return g;
 const n=copy(g),cost=fleetCost(n),id=`BG-${String(n.fleet.length+1).padStart(3,'0')}`,slot=freeBerth(n);
 n.cash-=cost;n.fleet.push({id,name:['','Mahakam Express','Kayan Pioneer'][n.fleet.length]||'Mahakam Barge',cap:300,status:slot?'berthed':'anchorage',berth:slot,cargo:0,routeId:null,remaining:0,totalTime:0,reward:0,departedCargo:0,loading:false});n.selectedBarge=id;event(n,`Tongkang ${id} dibeli. ${slot?'Bersandar di berth '+slot:'Menunggu dermaga kosong'}.`,'upgrade');return n;
}
export function berthBarge(g,id){const b=g.fleet.find(v=>v.id===id),free=freeBerth(g);if(g.paused||!b||b.status!=='anchorage'||!free)return g;const n=copy(g);const item=n.fleet.find(v=>v.id===id);item.status='berthed';item.berth=free;event(n,`${id} selesai ditugaskan ke Berth ${free}.`,'success');return n;}
export function assignContract(g,id,bargeId=g.selectedBarge){const route=routeFor(id),v=g.fleet.find(b=>b.id===bargeId);
 if(g.paused||!route||!v||v.status!=='berthed'||v.routeId||v.cargo>0||route.tons>v.cap)return g;
 const n=copy(g),b=n.fleet.find(x=>x.id===bargeId);b.routeId=id;event(n,`Kontrak ${route.city} dialokasikan ke ${bargeId}: ${route.tons} ton.`,'info');return n;
}
export function cancelContract(g,id=g.selectedBarge){const v=g.fleet.find(b=>b.id===id);if(g.paused||!v||!v.routeId||v.cargo>0||v.status!=='berthed')return g;const n=copy(g);n.fleet.find(b=>b.id===id).routeId=null;return n;}
export function startLoading(g,id=g.selectedBarge){const v=g.fleet.find(b=>b.id===id),route=routeFor(v?.routeId);if(g.paused||!v||!route||v.status!=='berthed'||v.cargo>=route.tons||g.jetty<.1||safeTonnes(g)<=v.cargo)return g;
 const n=copy(g);n.fleet.find(b=>b.id===id).status='loading';event(n,`Ship loader mengisi ${id} di Berth ${v.berth}.`,'success');return n;
}
export function stopLoading(g,id=g.selectedBarge){const v=g.fleet.find(b=>b.id===id);if(g.paused||!v||v.status!=='loading')return g;const n=copy(g);n.fleet.find(b=>b.id===id).status='berthed';return n;}
export function canDepart(g,id=g.selectedBarge){const v=g.fleet.find(b=>b.id===id),r=routeFor(v?.routeId);
 if(!v||!r||!['berthed','loading'].includes(v.status))return {ok:false,reason:'Pilih tongkang bersandar dan kontrak aktif.'};
 if(v.cargo<r.tons-.001)return {ok:false,reason:`Muatan belum lengkap: ${Math.round(v.cargo)} / ${r.tons} ton.`};
 if(v.cargo>safeTonnes(g))return {ok:false,reason:`Sungai surut. Batas aman ${safeTonnes(g)} ton; tunggu air naik.`};
 return {ok:true,reason:'Siap berangkat'};
}
export function depart(g,id=g.selectedBarge){if(g.paused||!canDepart(g,id).ok)return g;
 const n=copy(g),v=n.fleet.find(b=>b.id===id),r=routeFor(v.routeId);v.status='sailing';v.berth=null;v.remaining=r.time;v.totalTime=r.time;v.departedCargo=v.cargo;v.reward=Math.round(r.reward*priceIndex(n));
 event(n,`${id} berlayar menuju ${r.city}. Estimasi ${r.time} detik simulasi.`,'success');return n;
}
export function serviceFleet(g){if(g.paused||g.cash<1650||g.health>=99&&g.fuel>=99)return g;const n=copy(g);n.cash-=1650;n.health=100;n.fuel=100;event(n,'Servis alat berat selesai. Kesehatan dan bahan bakar dipulihkan.','upgrade');return n;}
export function tick(g,seconds){const dt=clamp(Number(seconds)||0,0,4);if(g.paused||dt<=0)return g;const n=copy(g);n.clock=round(n.clock+dt);const countBefore=totalOre(n);
 const factor=n.health>=25?1:.45;
 const mined=Math.min(pitCap()-n.pit,extractionRate(n)*dt);n.pit=round(n.pit+Math.max(0,mined));
 const haul=Math.min(n.pit,stockCap(n)-n.stockpile,haulRate(n)*dt);n.pit=round(n.pit-haul);n.stockpile=round(n.stockpile+haul);
 if(n.conveyorOn){const moved=Math.min(n.stockpile,jettyCap(n)-n.jetty,conveyorRate(n)*dt);n.stockpile=round(n.stockpile-moved);n.jetty=round(n.jetty+moved);}
 for(const b of n.fleet){if(b.status!=='loading')continue;const r=routeFor(b.routeId);if(!r){b.status='berthed';continue;}
  const amount=Math.max(0,Math.min(n.jetty,loaderRate(n)*dt,r.tons-b.cargo,safeTonnes(n)-b.cargo));
  b.cargo=round(b.cargo+amount);n.jetty=round(n.jetty-amount);
  if(b.cargo>=r.tons-.001||b.cargo>=safeTonnes(n)-.001){b.status='berthed';if(b.cargo>=r.tons-.001)event(n,`${b.id} siap berangkat: ${r.tons} ton lengkap.`,'success');}
 }
 for(const b of n.fleet){if(b.status!=='sailing')continue;b.remaining=round(Math.max(0,b.remaining-dt));if(b.remaining<=0){
   n.cash+=b.reward;n.stats.revenue+=b.reward;n.stats.shipped+=b.departedCargo;n.stats.voyages++;n.stats.xp+=Math.round(b.departedCargo/3);
   event(n,`${b.id} tiba di smelter. Pembayaran +$${b.reward.toLocaleString('en-US')}.`,'success');
   const slot=freeBerth(n);Object.assign(b,{status:slot?'berthed':'anchorage',berth:slot,cargo:0,routeId:null,remaining:0,totalTime:0,reward:0,departedCargo:0,loading:false});
 }}
 const activity=mined+haul; if(activity>0){n.health=round(Math.max(12,n.health-dt*.004));n.fuel=round(Math.max(4,n.fuel-dt*.008));}
 // Important: all remaining ore is conserved; only shipped cargo leaves the system.
 return n;
}
const validNumber=(n,max=1e12)=>Number.isFinite(n)&&n>=0&&n<=max;
export function sanitizeSave(s){const fresh=newGame();if(!s||s.version!==CONFIG_VERSION||typeof s!=='object')return fresh;
 try{
  if(!validNumber(s.cash)||!validNumber(s.clock)||!validNumber(s.pit,120)||!validNumber(s.stockpile,1e6)||!validNumber(s.jetty,1e6)||!validNumber(s.health,100)||!validNumber(s.fuel,100))return fresh;
  if(!s.levels||Object.entries(UPGRADES).some(([key,o])=>!Number.isInteger(s.levels[key])||s.levels[key]<0||s.levels[key]>o.max))return fresh;
  if(s.stockpile>stockCap(s)+.01||s.jetty>jettyCap(s)+.01)return fresh;
  if(!Array.isArray(s.fleet)||s.fleet.length<1||s.fleet.length>3||new Set(s.fleet.map(b=>b?.id)).size!==s.fleet.length)return fresh;
  for(const b of s.fleet){if(!b||typeof b.id!=='string'||!['berthed','loading','sailing','anchorage'].includes(b.status)||!validNumber(b.cargo,300)||!validNumber(b.remaining,200)||!validNumber(b.reward)||!validNumber(b.departedCargo,300)||!(!b.routeId||routeFor(b.routeId)))return fresh;}
  if(!s.stats||!['shipped','voyages','revenue','manual','xp'].every(k=>validNumber(s.stats[k])))return fresh;
  const n={...fresh,...s,levels:{...s.levels},stats:{...s.stats},fleet:copy(s.fleet),logs:Array.isArray(s.logs)?s.logs.filter(e=>e&&typeof e.message==='string').slice(0,14):fresh.logs};
  n.speed=[1,2,4].includes(n.speed)?n.speed:1;n.theme=['light','dark'].includes(n.theme)?n.theme:'light';n.quality=['eco','normal'].includes(n.quality)?n.quality:'eco';n.view=['2d','3d'].includes(n.view)?n.view:'3d';n.paused=Boolean(n.paused);n.conveyorOn=Boolean(n.conveyorOn);
  if(!n.fleet.some(b=>b.id===n.selectedBarge))n.selectedBarge=n.fleet[0].id;
  // Protect against corrupted berth occupancy or stale loading states.
  const occupied=new Set();for(const b of n.fleet){if(['berthed','loading'].includes(b.status)){
    if(!Number.isInteger(b.berth)||b.berth<1||b.berth>berthCount(n)||occupied.has(b.berth)){b.status='anchorage';b.berth=null;}else occupied.add(b.berth);
  }else b.berth=null;if(b.status==='loading'&&!routeFor(b.routeId))b.status='berthed';}
  return n;
 }catch{return fresh;}
}
export function readSave(storage){try{const source=storage===undefined?globalThis.localStorage:storage;return sanitizeSave(JSON.parse(source?.getItem(SAVE_KEY)||'null'));}catch{return newGame();}}
export function writeSave(g,storage){try{const destination=storage===undefined?globalThis.localStorage:storage;destination?.setItem(SAVE_KEY,JSON.stringify(g));return true;}catch{return false;}}
export function nextStep(g){const b=selectedBarge(g),r=routeFor(b?.routeId),can=canDepart(g,b?.id);
 if(g.paused)return {title:'Simulasi dijeda',detail:'Lanjutkan simulasi untuk menjalankan tambang.',action:'resume'};
 if(!g.conveyorOn&&g.stockpile>30)return {title:'Aktifkan konveyor',detail:'Stockpile menumpuk, tetapi jalur jetty berhenti.',action:'conveyor'};
 if(!b||b.status==='sailing')return {title:'Tongkang sedang berlayar',detail:'Tunggu pembayaran saat tiba, atau pilih tongkang lain.',action:'select'};
 if(b.status==='anchorage')return {title:'Sandarkan tongkang',detail:'Pilih berth kosong agar tongkang bisa dimuat.',action:'berth'};
 if(!r)return {title:'Pilih kontrak smelter',detail:'Tetapkan tujuan dan target tonase untuk tongkang yang bersandar.',action:'contracts'};
 if(can.ok)return {title:'Muatan siap berlayar',detail:`Kirim ${Math.round(b.cargo)} ton menuju ${r.city} dan terima pembayaran saat tiba.`,action:'depart'};
 if(r.tons>safeTonnes(g))return {title:'Perhatikan kedalaman sungai',detail:`Batas aman saat ini ${safeTonnes(g)} ton. Tunggu air naik atau pilih kontrak lebih kecil.`,action:'draft'};
 if(b.status==='loading')return {title:'Proses pemuatan berlangsung',detail:'Monitor loader dan pasokan jetty. Jangan berangkat sebelum muatan lengkap.',action:'monitor'};
 if(g.jetty<1)return {title:'Alirkan ore ke jetty',detail:'Pastikan stockpile memiliki ore dan konveyor menyala.',action:'conveyor'};
 return {title:'Mulai memuat tongkang',detail:`Target ${r.tons} ton dari buffer jetty ke ${b.id}.`,action:'load'};
}
