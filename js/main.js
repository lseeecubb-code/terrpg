(() => {
  const canvas=document.getElementById('game'), ui=document.getElementById('ui');
  const engine=new BABYLON.Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true});
  const scene=new BABYLON.Scene(engine);
  scene.clearColor=new BABYLON.Color4(.035,.07,.13,1);
  const camera=new BABYLON.FreeCamera('camera',new BABYLON.Vector3(0,6,-18),scene);
  camera.setTarget(new BABYLON.Vector3(0,3,0));
  const hemi=new BABYLON.HemisphericLight('sun',new BABYLON.Vector3(0,1,0),scene); hemi.intensity=1.1;
  const key=new BABYLON.DirectionalLight('key',new BABYLON.Vector3(-.3,-1,.5),scene); key.intensity=.65;
  const keys={}; addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['1','2','3'].includes(e.key))useSkill(+e.key-1)}); addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
  let player, monsters=[], projectiles=[], state='world', last=performance.now(), cooldowns=[0,0,0];
  const mat=(name,color,alpha=1)=>{const m=new BABYLON.StandardMaterial(name,scene);m.diffuseColor=BABYLON.Color3.FromHexString(color);m.alpha=alpha;return m};
  const groundMat=mat('ground','#304a35'), stoneMat=mat('stone','#53616c'), playerMat=mat('player','#d6a76b'), enemyMats={slime:mat('slime','#6fae59'),wisp:mat('wisp','#72b6e8'),crawler:mat('crawler','#8b715a')};
  const block=(x,y,z,sx=1,sy=1,sz=1,m=groundMat)=>{const b=BABYLON.MeshBuilder.CreateBox('tile',{width:sx,height:sy,depth:sz},scene);b.position.set(x,y,z);b.material=m;return b};
  for(let x=-90;x<=90;x++){const h=1.7+Math.sin(x*.12)*.45+Math.sin(x*.047)*.8;for(let y=0;y<Math.max(1,Math.floor(h));y++)block(x,y*.95,0,1,.95,3,y<1?groundMat:stoneMat)}
  player=BABYLON.MeshBuilder.CreateBox('player',{width:.75,height:1.5,depth:.5},scene);player.position.set(0,2.2,0);player.material=playerMat;
  const spawnEnemy=(def,x,z)=>{const e=BABYLON.MeshBuilder.CreateBox(def.id,{width:.8,height:.8,depth:.65},scene);e.position.set(x,2.0,z);e.material=enemyMats[def.id]||enemyMats.slime;e.metadata={def,hp:def.hp,t:Math.random()*6,target:player};monsters.push(e)};
  TERRPG_DATA.enemies.forEach((d,i)=>spawnEnemy(d,-9+i*9,(i%2?1.8:-1.8)));
  function nearest(){let best=null,bd=Infinity;for(const e of monsters){if(!e.isDisposed()&&e.metadata.hp>0){const d=BABYLON.Vector3.Distance(e.position,player.position);if(d<bd){bd=d;best=e}}}return best}
  function useSkill(i){if(state!=='world'||cooldowns[i]>0)return;const s=TERRPG_DATA.skills[i];const target=nearest();if(!target)return;cooldowns[i]=s.cooldown;
    if(s.target==='area'){for(const e of monsters){if(BABYLON.Vector3.Distance(e.position,player.position)<6)e.metadata.hp-=s.power}else spawnBurst(player.position.clone(),s.power)}
    else {const p=BABYLON.MeshBuilder.CreateSphere('skill',{diameter:.18+ i*.08,segments:8},scene);p.position=player.position.add(new BABYLON.Vector3(0,.15,0));p.material=mat('skill'+i,['#f7d36b','#7bd1ff','#e9a8ff'][i]);p.metadata={target,power:s.power,speed:.22+i*.04};projectiles.push(p)}
  }
  function spawnBurst(pos,power){for(let i=0;i<14;i++){const a=i*Math.PI*2/14;const p=BABYLON.MeshBuilder.CreateSphere('burst',{diameter:.1,segments:6},scene);p.position=pos.clone();p.material=mat('burst','#e9a8ff');p.metadata={vx:Math.cos(a)*.11,vz:Math.sin(a)*.11,life:1.2,power};projectiles.push(p)}}
  function update(dt){for(const k in cooldowns)cooldowns[k]=Math.max(0,cooldowns[k]-dt);
    const dx=(keys.d?1:0)-(keys.a?1:0),dz=(keys.s?1:0)-(keys.w?1:0);player.position.x+=dx*TERRPG_DATA.player.speed*dt*60;player.position.z+=dz*TERRPG_DATA.player.speed*dt*60;player.position.x=BABYLON.Scalar.Clamp(player.position.x,-88,88);player.position.z=BABYLON.Scalar.Clamp(player.position.z,-4,4);
    camera.position.x=BABYLON.Scalar.Lerp(camera.position.x,player.position.x,dt*4);camera.position.z=BABYLON.Scalar.Lerp(camera.position.z,-18,dt*3);camera.setTarget(new BABYLON.Vector3(player.position.x,2.2,0));
    for(const e of monsters){if(e.metadata.hp<=0){e.dispose();continue}const d=e.metadata.def,dx=player.position.x-e.position.x,dz=player.position.z-e.position.z,len=Math.hypot(dx,dz)||1;e.metadata.t+=dt;if(d.behavior==='orbit'){e.position.x+=Math.cos(e.metadata.t)*.018; e.position.z+=Math.sin(e.metadata.t)*.035}else{e.position.x+=dx/len*d.speed*dt*60;e.position.z+=dz/len*d.speed*dt*60}e.position.y=1.95+Math.abs(Math.sin(e.metadata.t*4))*(d.behavior==='hop'?.45:.08)}
    for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i],md=p.metadata;if(md.target){if(md.target.isDisposed()){p.dispose();projectiles.splice(i,1);continue}const v=md.target.position.subtract(p.position);v.y=0;if(v.length()<.45){md.target.metadata.hp-=md.power;p.dispose();projectiles.splice(i,1);continue}v.normalize();p.position.addInPlace(v.scale(md.speed*dt*60))}else{p.position.x+=md.vx*dt*60;p.position.z+=md.vz*dt*60;md.life-=dt;if(md.life<=0){p.dispose();projectiles.splice(i,1)}}}
  }
  function renderUI(){ui.innerHTML='<div class="hud"><b>TERRPG</b><br>2.5D WebGL Prototype<br>WASD: Move · 1/2/3: Skills</div><div class="skills">'+TERRPG_DATA.skills.map((s,i)=>`<div class="skill">${i+1}<br><small>${s.name}</small></div>`).join('')+'</div>'}
  renderUI(); engine.runRenderLoop(()=>{const now=performance.now(),dt=Math.min(.033,(now-last)/1000);last=now;update(dt);scene.render()}); addEventListener('resize',()=>engine.resize());
})();
