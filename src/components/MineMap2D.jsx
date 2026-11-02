import React from 'react';
import {stockCap,jettyCap,selectedBarge,riverDepth} from '../lib/engine.js';
function Zone({x,y,w,h,color,title,sub,onClick,selected=false}){return <g className={`map-zone ${selected?'map-selected':''}`} onClick={onClick} tabIndex={0} role="button" aria-label={title} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onClick();}}}>
 <rect x={x} y={y} width={w} height={h} rx={13} fill={color} stroke={selected?'#2d7ef0':'#b3c4d1'} strokeWidth={selected?4:1.5}/><text x={x+14} y={y+30} className="map-zone-title">{title}</text><text x={x+14} y={y+53} className="map-zone-detail">{sub}</text></g>}
export default function MineMap2D({game,selected,onSelect,onMine}){
 const sel=(kind,id)=>selected?.kind===kind&&selected?.id===id;
 const pick=(kind,id)=>()=>onSelect({kind,id});
 return <div className="map-wrapper"><svg viewBox="0 0 1024 580" role="img" aria-label="Peta interaktif operasi tambang Kalimantan" preserveAspectRatio="xMidYMid meet">
  <defs><linearGradient id="riverG" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#64b9d1"/><stop offset="1" stopColor="#256e9b"/></linearGradient><pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#c5d5d2" strokeWidth=".6"/></pattern></defs>
  <rect x="0" y="0" width="1024" height="580" fill={game.theme==='dark'?'#263342':'#e1e9e2'}/><rect width="1024" height="580" fill="url(#grid)" opacity=".6"/>
  <rect x="770" y="0" width="254" height="580" fill="url(#riverG)"/>
  <path d="M755 0V580" stroke="#f0d29e" strokeWidth="8"/><path d="M780 65Q840 42 910 65M785 490Q886 462 989 491" fill="none" stroke="#a6e1e7" strokeWidth="4" opacity=".7"/>
  <path d="M70 385H665" stroke="#748a90" strokeWidth="76" strokeLinecap="round"/><path d="M80 385H670" stroke="#fff5c1" strokeWidth="2" strokeDasharray="24 22"/>
  <Zone x={32} y={43} w={215} h={182} color="#b18b68" title="OPEN PIT MINE" sub={`${Math.round(game.pit)} / 120 ton · klik area untuk menambang`} selected={sel('pit','pit')} onClick={()=>{onSelect({kind:'pit',id:'pit'});onMine();}}/>
  <Zone x={295} y={75} w={166} h={109} color="#e3b34e" title="EXCAVATOR" sub="Pengerukan aktif" selected={sel('excavator','EX-01')} onClick={pick('excavator','EX-01')}/>
  <Zone x={295} y={265} w={155} h={77} color="#e0bc77" title="HAUL TRUCK" sub="Pit → stockpile" selected={sel('haul','HT-01')} onClick={pick('haul','HT-01')}/>
  <Zone x={486} y={43} w={236} h={183} color="#c8aa8a" title="STOCKPILE" sub={`${Math.round(game.stockpile)} / ${stockCap(game)} ton`} selected={sel('stockpile','stockpile')} onClick={pick('stockpile','stockpile')}/>
  <Zone x={485} y={270} w={235} h={79} color="#9ab6b8" title="JETTY CONVEYOR" sub={game.conveyorOn?'RUNNING':'STOPPED'} selected={sel('conveyor','CV-01')} onClick={pick('conveyor','CV-01')}/>
  <Zone x={550} y={442} w={189} h={109} color="#bad4cd" title="JETTY BUFFER" sub={`${Math.round(game.jetty)} / ${jettyCap(game)} ton`} selected={sel('jetty','JT-01')} onClick={pick('jetty','JT-01')}/>
  <path d="M240 133H288M460 126H480M640 227V264M628 352V432M739 485H775" stroke="#2e85d4" strokeWidth="5" fill="none" strokeDasharray="10 8"/>
  {game.fleet.map((b,i)=><g key={b.id} onClick={pick('barge',b.id)} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')pick('barge',b.id)();}} className="map-zone">
    <rect x={796} y={90+i*144} width={194} height={107} rx={16} fill={sel('barge',b.id)?'#cceeff':'#ecf5f6'} stroke="#246da0" strokeWidth="3"/><rect x={811} y={105+i*144} width={43} height={75} rx="6" fill="#2e5060"/><text x={865} y={126+i*144} className="map-barge-title">{b.id}</text><text x={865} y={150+i*144} className="map-barge-detail">{b.status.toUpperCase()}</text><text x={865} y={173+i*144} className="map-barge-detail">{Math.round(b.cargo)} ton</text>
   </g>)}
  <text x="795" y="32" fill="#e4faff" fontSize="17" fontWeight="800">SUNGAI MAHAKAM</text><text x="795" y="53" fill="#e4faff" fontSize="12">Kedalaman {riverDepth(game).toFixed(1)} m</text>
 </svg><div className="map-help">Klik objek untuk memeriksa status. Klik pit untuk menambang +10 ton. Peta 2D dan scene 3D menggunakan save yang sama.</div></div>
}
