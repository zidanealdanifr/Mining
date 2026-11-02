import React,{memo,useEffect,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,Html} from '@react-three/drei';
import * as THREE from 'three';
import {berthCount,extractionRate,haulRate,conveyorRate,riverDepth,routeFor,safeTonnes,stockCap,jettyCap} from '../lib/engine.js';

const P={land:'#d7d6be',concrete:'#a3aeb4',road:'#65737b',yellow:'#eab85c',brown:'#956940',rock:'#b47b50',dark:'#273a49',water:'#408ea3',foam:'#9fe2ed',green:'#5b957b',steel:'#526f80',white:'#e4ecf1',blue:'#2277c8'};
function Cube({p=[0,0,0],s=[1,1,1],color='#ccc',rotation,children,...rest}){
 return <mesh castShadow receiveShadow position={p} rotation={rotation} {...rest}><boxGeometry args={s}/><meshStandardMaterial color={color} roughness={.82}/>{children}</mesh>;
}
function Ground(){return <group>
 <Cube p={[-2,-.6,0]} s={[44,1.1,29]} color={P.land}/>
 <Cube p={[20,-.44,0]} s={[20,.9,30]} color={P.water}/>
 <Cube p={[9,.04,0]} s={[.32,.22,28]} color="#b1c3c0"/>
 <Cube p={[-4,.07,5]} s={[27,.11,5.5]} color={P.road}/>
 {Array.from({length:12},(_,i)=><Cube key={i} p={[-17+i*2.3,.135,5]} s={[1.05,.015,.07]} color="#e5d6a4"/>)}
 <Cube p={[-2,.05,10.7]} s={[35,.08,4.3]} color="#c2c1a5"/>
 {Array.from({length:6},(_,i)=><Cube key={i} p={[11,.2,-12+i*4.5]} s={[.48,.28,1.3]} color="#c3b28c"/>)}
 {Array.from({length:8},(_,i)=><Cube key={i} p={[14+i%3*3,.09,-10+i*2.8]} s={[1.1,.018,.045]} color={P.foam}/>)}
 </group>;}
function Mark({p,children}){return <Html center distanceFactor={20} position={p} style={{pointerEvents:'none'}}><span className="mine-world-label">{children}</span></Html>;}
function Target({enabled,x=0,z=0,radius=1.2}){return enabled?<mesh position={[x,.12,z]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[radius,radius+.08,42]}/><meshBasicMaterial color="#2b87fa" transparent opacity={.82} side={THREE.DoubleSide}/></mesh>:null;}
function Interactive({kind,id,onSelect,children,...rest}){return <group {...rest} onClick={e=>{e.stopPropagation();onSelect({kind,id});}} onPointerOver={e=>{e.stopPropagation();document.body.style.cursor='pointer';}} onPointerOut={()=>{document.body.style.cursor='auto';}}>{children}</group>;}
const Pit=memo(function Pit({onSelect,selected,pit,clickMine}){return <Interactive kind="pit" id="pit" onSelect={onSelect} position={[-13,0,-5]}>
 {Array.from({length:4},(_,i)=><mesh key={i} position={[0,-.15+i*.09,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[2+i*.8,2.48+i*.8,30]}/><meshStandardMaterial color={['#a36a40','#b78354','#d4a46d','#d4b08a'][i]} side={THREE.DoubleSide}/></mesh>)}
 <mesh position={[0,-.52,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[2.3,32]}/><meshStandardMaterial color="#684c35"/></mesh>
 {Array.from({length:12},(_,i)=><mesh key={i} position={[(i%4-1.5)*.85,.1,Math.floor(i/4)*.8-1.1]} castShadow><dodecahedronGeometry args={[.26+(i%3)*.11,0]}/><meshStandardMaterial color={i%3?'#7c5b47':'#52493d'}/></mesh>)}
 <Target enabled={selected?.kind==='pit'} radius={4.6}/><Mark p={[0,2.6,-4.3]}>OPEN PIT · +10 TON / KLIK</Mark>
 <mesh position={[0,.3,0]} onClick={e=>{e.stopPropagation();clickMine();}}><cylinderGeometry args={[2.9,2.9,.45,24]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
 </Interactive>});
function Excavator({time,active,selected,onSelect}){
 const arm=useRef();useFrame(()=>{if(arm.current)arm.current.rotation.x=active?Math.sin(time.current*1.7)*.2-.08:-.16;});
 return <Interactive kind="excavator" id="EX-01" onSelect={onSelect} position={[-11.2,.25,-2.7]}>
 <Target enabled={selected?.kind==='excavator'} radius={1.5}/>
 <Cube p={[0,.42,0]} s={[2,.5,1.45]} color="#343f47"/>
 {[-.6,.6].map(z=><Cube key={z} p={[0,.15,z]} s={[2.05,.3,.34]} color="#2b3743"/>)}
 <Cube p={[-.2,1.05,0]} s={[1.5,.88,1.25]} color="#edb145"/>
 <Cube p={[-.54,1.33,-.65]} s={[.65,.48,.08]} color="#5d8ca0"/>
 <group ref={arm} position={[.56,1.28,0]}>
 <Cube p={[.85,.34,0]} s={[2,.28,.27]} color="#e6a22e" rotation={[0,0,.35]}/>
 <Cube p={[2.0,-.25,0]} s={[.24,1.65,.25]} color="#e6a22e" rotation={[0,0,-.32]}/>
 <Cube p={[2.28,-1.05,0]} s={[.75,.48,.9]} color="#4e6068"/>
 </group><Mark p={[0,3.45,0]}>EXCAVATOR EX-01</Mark>
 </Interactive>;
}
function HaulTruck({time,active,onSelect,selected}){
 const ref=useRef();useFrame(()=>{if(!ref.current)return;const a=active?Math.sin(time.current*.48):-.9;const t=(a+1)/2;ref.current.position.set(-8.2+t*7,.28,4.6);ref.current.rotation.y=Math.cos(time.current*.48)<0?Math.PI:0;});
 return <Interactive kind="haul" id="HT-01" onSelect={onSelect}><group ref={ref} position={[-8,.28,4.6]}>
 <Target enabled={selected?.kind==='haul'} radius={1.55}/><Cube p={[0,.78,0]} s={[1.7,.95,1.4]} color="#e2a43d"/><Cube p={[1.2,.78,0]} s={[.95,.72,1.25]} color="#eab44f"/>
 <Cube p={[1.22,1,.63]} s={[.5,.31,.03]} color="#5598ab"/>
 <Cube p={[-.25,1.3,0]} s={[1.7,.13,1.4]} color="#c58f37"/>
 {[-1,1].map(z=>[-.85,1.1].map(x=><mesh key={`${x}-${z}`} position={[x,.28,z*.66]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.33,.33,.17,10]}/><meshStandardMaterial color="#30383b"/></mesh>))}
 <Mark p={[0,2.5,0]}>HAUL TRUCK HT-01</Mark></group></Interactive>;
}
function OreMound({position,size=1,color=P.rock}){return <mesh position={position} scale={[size,Math.max(.1,size*.7),size]} castShadow receiveShadow><coneGeometry args={[1,1.75,9]}/><meshStandardMaterial color={color} roughness={1} flatShading/></mesh>}
function Stockpile({game,selected,onSelect}){const ratio=game.stockpile/stockCap(game);return <Interactive kind="stockpile" id="stockpile" onSelect={onSelect} position={[1.4,0,-6.8]}>
 <Cube p={[0,.14,0]} s={[8,.22,5.3]} color="#a0a7a4"/>
 <OreMound position={[-1.9,.4+ratio*1.35,0]} size={.6+ratio*1.55}/>
 <OreMound position={[1.3,.32+ratio,1]} size={.55+ratio*1.12} color="#ad724e"/>
 <Target enabled={selected?.kind==='stockpile'} radius={3.4}/><Mark p={[0,4.7,-2.8]}>STOCKPILE · {Math.round(game.stockpile)} TON</Mark>
 </Interactive>}
function Conveyor({game,time,onSelect,selected}){
 const moving=game.conveyorOn&&game.stockpile>.1;
 const boxes=useRef([]);
 useFrame(()=>{boxes.current.forEach((b,i)=>{if(b){const t=moving?((time.current*.25+i*.22)%1):i*.2;b.position.x=-3.4+7.6*t;}});});
 return <Interactive kind="conveyor" id="CV-01" onSelect={onSelect} position={[7,.12,-2.1]}>
 <Cube p={[0,1.15,0]} s={[8.5,.32,1.1]} color="#536b75" rotation={[0,0,.12]}/>
 {Array.from({length:12},(_,i)=><Cube key={i} p={[-3.6+i*.66,1.36+(i*.66*.12),0]} s={[.46,.12,.8]} color={i%2?'#79909a':'#9db0b5'}/>)}
 {[-3,-1.5,0,1.5,3].map(x=><Cube key={x} p={[x,.65,0]} s={[.1,1.3,.1]} color="#788891"/>)}
 {Array.from({length:4},(_,i)=><mesh key={i} ref={el=>boxes.current[i]=el} position={[-3+i*1.5,1.57,0]} castShadow><dodecahedronGeometry args={[.22,0]}/><meshStandardMaterial color="#7a5236"/></mesh>)}
 <Target enabled={selected?.kind==='conveyor'} radius={2.1}/><Mark p={[1,3.2,0]}>JETTY CONVEYOR {moving?'RUNNING':'STOPPED'}</Mark>
 </Interactive>}
function Jetty({game,onSelect,selected}){return <Interactive kind="jetty" id="JT-01" onSelect={onSelect} position={[12,0,4]}>
 <Cube p={[.1,.4,0]} s={[5,.65,10.7]} color="#9eaeb1"/>
 {[-3.9,0,3.9].map(z=>[0,2].map(x=><Cube key={`${x}-${z}`} p={[x,-.2,z]} s={[.25,1,.25]} color="#4e6473"/>))}
 <Cube p={[-.2,1.2,-4.1]} s={[1.7,1.7,1.4]} color="#688c99"/>
 <Cube p={[-.2,2.1,-4.1]} s={[1.9,.2,1.6]} color="#e8b957"/>
 <OreMound position={[-.6,1.1,1.2]} size={.35+game.jetty/jettyCap(game)*.5}/>
 <Target enabled={selected?.kind==='jetty'} radius={2}/>
 <Mark p={[0,3,2]}>JETTY BUFFER · {Math.round(game.jetty)} TON</Mark>
 </Interactive>}
function ShipLoader({game,time,onSelect,selected}){
 const arm=useRef(); const loading=game.fleet.some(b=>b.status==='loading');
 useFrame(()=>{if(arm.current)arm.current.rotation.y=loading?Math.sin(time.current*.45)*.22:.0;});
 return <Interactive kind="loader" id="SL-01" onSelect={onSelect} position={[13.7,0,-3.3]}>
 <Target enabled={selected?.kind==='loader'} radius={1.6}/>
 <Cube p={[0,1.25,0]} s={[.65,2.6,.65]} color="#d8a33f"/>
 <Cube p={[0,2.63,0]} s={[1.1,.2,1.1]} color="#607884"/>
 <group ref={arm} position={[0,2.6,0]}><Cube p={[1.9,.05,0]} s={[3.95,.19,.32]} color="#e5ac40"/>
 <Cube p={[3.4,-.85,0]} s={[.08,1.75,.08]} color="#5c6870"/>
 <Cube p={[3.4,-1.7,0]} s={[.8,.3,1]} color={loading?'#8d694b':'#566d76'}/></group>
 <Mark p={[0,4.1,0]}>SHIP LOADER · {loading?'LOADING':'STANDBY'}</Mark>
 </Interactive>;
}
function Barge({barge,index,time,game,onSelect,selected}){
 const ref=useRef();useFrame(()=>{if(!ref.current)return;const voyage=barge.status==='sailing';const t=voyage?1-barge.remaining/Math.max(1,barge.totalTime):0;const berth=(barge.berth||index+1);ref.current.position.x=voyage?17+Math.min(1,t)*7:17.2;ref.current.position.z=voyage?(-7+Math.min(1,t)*12):(-6.5+(berth-1)*6.1);ref.current.position.y=-.04+Math.sin(time.current*1.5+index)*.06;ref.current.rotation.y=voyage?.12:0;});
 const qty=Math.min(16,Math.ceil(barge.cargo/18));
 return <Interactive kind="barge" id={barge.id} onSelect={onSelect}>
 <group ref={ref} position={[17,0,-6.5+index*6.1]}>
 <Target enabled={selected?.kind==='barge'&&selected.id===barge.id} radius={2.4}/>
 <Cube p={[0,.35,0]} s={[3,.73,6.15]} color="#284755"/>
 <Cube p={[0,.76,0]} s={[2.65,.1,5.75]} color="#a1aeb0"/>
 <Cube p={[-.9,1.15,-2.15]} s={[.85,.95,1.22]} color="#f1eee4"/>
 <Cube p={[-.9,1.42,-2.77]} s={[.65,.29,.05]} color="#5f9aab"/>
 {Array.from({length:qty},(_,i)=><Cube key={i} p={[-.7+(i%3)*.72,1.0+Math.floor(i/9)*.46,-1.1+Math.floor(i%9/3)*1.3]} s={[.65,.38,1.13]} color={i%3===0?'#aa774c':i%3===1?'#765948':'#bc9366'}/>)}
 <Mark p={[0,3.3,0]}>{barge.id} · {barge.status==='sailing'?'BERLAYAR':barge.status==='anchorage'?'MENUNGGU BERTH':`${Math.round(barge.cargo)} / ${barge.cap} TON`}</Mark>
 </group></Interactive>
}
function FramePulse({paused,quality}){const invalidate=useThree(s=>s.invalidate);useEffect(()=>{const id=setInterval(()=>invalidate(),1000/(paused?4:quality==='eco'?24:40));return ()=>clearInterval(id);},[invalidate,quality,paused]);return null;}
function World({game,selected,onSelect,onMine,controlRef,zoomSignal}){
 const time=useRef(game.clock);const orbit=useRef();const camera=useThree(s=>s.camera);
 useFrame((_,dt)=>{if(game.paused){time.current=game.clock;return;}time.current=Math.min(game.clock+.5*game.speed,time.current+Math.min(dt,.08)*game.speed);if(time.current<game.clock-.2)time.current=game.clock;});
 useEffect(()=>{if(!zoomSignal||!orbit.current)return; if(zoomSignal.kind==='reset'){camera.position.set(-21,25,30);orbit.current.target.set(0,0,0);orbit.current.update();}else{const toward=new THREE.Vector3().subVectors(camera.position,orbit.current.target),factor=zoomSignal.kind==='out'?1.3:.77;toward.multiplyScalar(factor);toward.clampLength(14,85);camera.position.copy(orbit.current.target).add(toward);orbit.current.update();}},[zoomSignal,camera]);
 return <>
 <color attach="background" args={[game.theme==='dark'?'#090d16':'#e6edf1']}/>
 <ambientLight intensity={1.8}/><hemisphereLight args={['#e5f5ff','#8b654b',1.1]}/>
 <directionalLight position={[-10,24,14]} intensity={2} castShadow={game.quality==='normal'} shadow-mapSize={[1024,1024]}/>
 <Ground/>
 <Pit selected={selected} onSelect={onSelect} pit={game.pit} clickMine={onMine}/>
 <Excavator selected={selected} onSelect={onSelect} time={time} active={game.pit<120&&!game.paused}/>
 <HaulTruck selected={selected} onSelect={onSelect} time={time} active={game.pit>0&&!game.paused}/>
 <Stockpile game={game} selected={selected} onSelect={onSelect}/>
 <Conveyor game={game} time={time} selected={selected} onSelect={onSelect}/>
 <Jetty game={game} selected={selected} onSelect={onSelect}/><ShipLoader game={game} selected={selected} onSelect={onSelect} time={time}/>
 {game.fleet.filter(b=>b.status!=='anchorage').map((b,i)=><Barge key={b.id} barge={b} index={i} time={time} game={game} selected={selected} onSelect={onSelect}/>)}
 <OrbitControls ref={orbit} makeDefault enableZoom minDistance={14} maxDistance={85} maxPolarAngle={1.35} enableDamping dampingFactor={.07} target={[0,0,0]}/>
 </>;
}
export default function MineScene3D({game,selected,onSelect,onMine,zoomSignal}){
 return <Canvas shadows={game.quality==='normal'} dpr={game.quality==='eco'?[.65,1]:[1,1.5]} camera={{position:[-21,25,30],fov:43,near:.1,far:160}} frameloop="demand" gl={{antialias:game.quality==='normal',powerPreference:'low-power'}} onPointerMissed={()=>onSelect(null)}>
 <FramePulse paused={game.paused} quality={game.quality}/><World game={game} selected={selected} onSelect={onSelect} onMine={onMine} zoomSignal={zoomSignal}/>
 </Canvas>;
}
