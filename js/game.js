(() => {
  "use strict";
  const D=window.TERRPG_DATA,$=id=>document.getElementById(id),canvas=$("world");
  const WORLD={AIR:0};Object.values(D.blocks).forEach(b=>WORLD[b.name]=b.id);
  const world=new window.TERRPG_WORLD(D,Math.floor(Math.random()*0xffffffff));world.generate();
  const renderer=new window.TERRPG_RENDERER(canvas,window.TERRPG_SHADERS,D),mesh=new window.TERRPG_MAP_MESH(world,Object.fromEntries(Object.values(D.blocks).map(b=>[b.id,{...b}])),D.TILE),gear=new window.TERRPG_PLAYER_GEAR();
  const keys=new Set(),enemies=[],inventory={dirt:80,stone:40,wood:24,coal:0,copper:0,iron:0,crystal:0,brick:0,torch:12};
  const player={x:D.WORLD_W/2,y:20,vx:0,vy:0,hp:100,maxHp:100,damage:4,selected:0,grounded:false,reach:6};
  const hotbar=["dirt","stone","wood","brick","torch","coal","copper","iron"];
  let time=20,day=0,selected=0,inventoryOpen=false,last=performance.now(),action=0,attackCd=0;
  const solid=id=>id!==0&&D.blocks[Object.keys(D.blocks).find(k=>D.blocks[k].id===id)]?.solid;
  const idForItem=n=>D.blocks[D.items[n]?.place||n]?.id||0;
  function add(n,c=1){inventory[n]=(inventory[n]||0)+c;ui();}
  function near(tx,ty){return Math.hypot(tx-player.x,ty-player.y)<=player.reach;}
  function ground(x){return world.surfaceY(x)-1;}
  function spawnEnemy(){const x=8+Math.floor(Math.random()*(D.WORLD_W-16)),eType=["crawler","hopper","stalker"][Math.floor(Math.random()*3)],d=D.enemyTypes[eType];enemies.push({type:eType,x,y:ground(x),hp:d.hp,maxHp:d.hp,color:d.color,cool:0});}
  for(let i=0;i<14;i++)spawnEnemy();
  function tryMine(tx,ty){
    if(action>0||!near(tx,ty))return;const id=world.get(tx,ty);if(!id)return;const name=Object.keys(D.blocks).find(k=>D.blocks[k].id===id);if(!name||name==="torch")return;
    const hardness=D.blocks[name].hardness||1; if((gear.tool==="copper pick"&&hardness>3)||hardness>4)return;
    world.set(tx,ty,0);add(D.blocks[name].drop||name,1);action=.16;
  }
  function tryPlace(tx,ty){
    if(action>0||!near(tx,ty)||world.get(tx,ty)!==0)return;const n=hotbar[selected],id=idForItem(n);if(!id||!(inventory[n]>0))return;
    const px=player.x,py=player.y-1;if(tx<px+.45&&tx+1>px-.45&&ty<py&&ty+1>py-1.2)return;
    world.set(tx,ty,id);inventory[n]--;action=.14;ui();
  }
  function attack(){
    if(attackCd>0)return;attackCd=.32;let best=null,bd=99;for(const e of enemies){const d=Math.hypot(e.x-player.x,e.y-player.y);if(d<bd&&d<3)best=e,bd=d;}if(!best)return;
    best.hp-=gear.damageBonus+player.damage+Math.floor(Math.random()*4);
    if(best.hp<=0){const i=enemies.indexOf(best);enemies.splice(i,1);add("coin",1);spawnEnemy();}
  }
  function update(dt){
    if(inventoryOpen)return;action-=dt;attackCd-=dt;time+=dt;if(time>=180){time-=180;day++}
    let dir=(keys.has("a")||keys.has("ArrowLeft")?-1:0)+(keys.has("d")||keys.has("ArrowRight")?1:0);player.vx+=dir*40*dt;player.vx*=Math.pow(.0005,dt);player.vx=window.TERRPG_MATH.clamp(player.vx,-7,7);
    const g=ground(player.x);if((keys.has("w")||keys.has(" ")||keys.has("ArrowUp"))&&player.grounded&&!player.jumpLock){player.vy=-11;player.jumpLock=true;}if(!(keys.has("w")||keys.has(" ")||keys.has("ArrowUp")))player.jumpLock=false;
    player.vy=Math.min(14,player.vy+28*dt);let nx=player.x+player.vx*dt;if(world.get(Math.floor(nx),Math.floor(player.y))===0&&world.get(Math.floor(nx),Math.floor(player.y-1))===0)player.x=window.TERRPG_MATH.clamp(nx,1,D.WORLD_W-2);
    let ny=player.y+player.vy*dt;if(world.get(Math.floor(player.x),Math.floor(ny+1))===0){player.y=Math.min(D.WORLD_H-2,ny);player.grounded=false;}else{player.y=g;player.vy=0;player.grounded=true;}
    for(const e of enemies){e.cool-=dt;const d=player.x-e.x;if(Math.abs(d)<14)e.x+=Math.sign(d)*D.enemyTypes[e.type].speed*dt;e.y=ground(e.x);if(Math.abs(d)<1&&Math.abs(e.y-player.y)<1.5&&e.cool<=0){e.cool=1.1;player.hp-=Math.max(1,D.enemyTypes[e.type].damage-gear.armorBonus);if(player.hp<=0){player.hp=100;player.x=D.WORLD_W/2;player.y=ground(player.x);}}}
    renderer.cam.x=window.TERRPG_MATH.clamp(player.x*D.TILE-canvas.clientWidth/2,0,D.WORLD_W*D.TILE-canvas.clientWidth);renderer.cam.y=window.TERRPG_MATH.clamp(player.y*D.TILE-canvas.clientHeight/2,0,D.WORLD_H*D.TILE-canvas.clientHeight);
  }
  function ui(){
    $("hpText").textContent=Math.ceil(player.hp)+"/"+player.maxHp;$("hpFill").style.width=Math.max(0,player.hp/player.maxHp*100)+"%";$("coords").textContent=Math.floor(player.x)+","+Math.floor(player.y);$("dayStatus").textContent=((time>90)?"NIGHT":"DAY")+" "+day;
    $("objective").textContent="Explore, mine, craft and survive. Tool: "+gear.tool;
    const h=$("hotbar");h.innerHTML=hotbar.map((n,i)=>"<button class='slot "+(i===selected?"active":"")+"' data-i='"+i+"'><span>"+(i+1)+"</span>"+n.slice(0,2).toUpperCase()+"<b>"+(inventory[n]||0)+"</b></button>").join("");
    h.querySelectorAll(".slot").forEach(b=>b.onclick=()=>{selected=+b.dataset.i;ui()});
    $("inventory").innerHTML="<h3>Inventory</h3>"+Object.entries(inventory).filter(([,v])=>v>0).map(([k,v])=>"<div class='inv-row'><span>"+k+"</span><b>"+v+"</b></div>").join("");
  }
  function renderMenu(kind){
    const mc=$("menuContent"),map={inventory:"Inventory",crafting:"Crafting",character:"Character",map:"World",bestiary:"Bestiary",achievements:"Achievements",settings:"Settings",controls:"Controls",save:"Save / Load"};
    if(kind==="save")mc.innerHTML="<div class='info'><button class='btn' id='saveNow'>Save</button> <button class='btn' id='loadNow'>Load</button></div>";
    else if(kind==="crafting")mc.innerHTML="<div class='info'><b>Recipes</b>"+Object.entries(D.recipes).map(([n,c])=>"<button class='btn craft' data-name='"+n+"'>"+n+" — "+Object.entries(c).map(([k,v])=>k+"×"+v).join(" ")+"</button>").join("")+"</div>";
    else if(kind==="character")mc.innerHTML="<div class='info'>Weapon: "+gear.weapon+"<br>Tool: "+gear.tool+"<br>Armor: "+gear.armor+"<br>Defense: "+gear.armorBonus+"<br>Damage bonus: "+gear.damageBonus+"</div>";
    else if(kind==="map")mc.innerHTML="<div class='info'>World "+D.WORLD_W+"×"+D.WORLD_H+" tiles<br>Seed "+world.seed+"<br>Current position "+Math.floor(player.x)+", "+Math.floor(player.y)+"</div>";
    else if(kind==="bestiary")mc.innerHTML="<div class='info'>"+Object.entries(D.enemyTypes).map(([n,e])=>"<div>"+n+" — "+e.hp+" HP, "+e.damage+" damage</div>").join("")+"</div>";
    else if(kind==="inventory")mc.innerHTML="<div class='info' id='inventory'>"+$("inventory").innerHTML+"</div>";
    else if(kind==="controls")mc.innerHTML="<div class='info'>A/D or arrows: move<br>W/Space: jump<br>Left click: mine / attack<br>Right click: place<br>1–8: hotbar<br>E: inventory<br>Esc: menu</div>";
    else if(kind==="settings")mc.innerHTML="<div class='info'><button class='btn' id='newWorld'>Generate New World</button></div>";
    else if(kind==="achievements")mc.innerHTML="<div class='info'>Mining, building, combat and exploration milestones will appear here.</div>";
    else mc.innerHTML="<div class='info'>Original WebGL blockworld prototype.</div>";
    mc.querySelectorAll(".craft").forEach(b=>b.onclick=()=>{const r=D.recipes[b.dataset.name];if(Object.entries(r).every(([k,v])=>(inventory[k]||0)>=v)){Object.entries(r).forEach(([k,v])=>inventory[k]-=v);add(b.dataset.name,1);ui();}});
    $("saveNow")?.addEventListener("click",save);$("loadNow")?.addEventListener("click",load);$("newWorld")?.addEventListener("click",()=>{world.generate();enemies.length=0;for(let i=0;i<14;i++)spawnEnemy();player.x=D.WORLD_W/2;player.y=ground(player.x);resume();});
  }
  function menu(kind="main"){ $("menuOverlay").classList.remove("hidden");renderMenu(kind);inventoryOpen=true; }
  function resume(){ $("menuOverlay").classList.add("hidden");inventoryOpen=false; }
  function save(){localStorage.setItem("terrpg-webgl-save",JSON.stringify({world:world.serialize(),player,inventory,gear:{weapon:gear.weapon,tool:gear.tool,armor:gear.armor,armorBonus:gear.armorBonus,damageBonus:gear.damageBonus},time,day}));}
  function load(){const r=localStorage.getItem("terrpg-webgl-save");if(!r)return;const s=JSON.parse(r);world.load(s.world);Object.assign(player,s.player);Object.keys(inventory).forEach(k=>delete inventory[k]);Object.assign(inventory,s.inventory);Object.assign(gear,s.gear);time=s.time;day=s.day;ui();}
  addEventListener("keydown",e=>{if(e.code==="KeyE"){inventoryOpen?resume():menu("inventory");return}if(e.code==="Escape"){inventoryOpen?resume():menu("main");return}keys.add(e.key);if(/^[1-8]$/.test(e.key)){selected=+e.key-1;ui()}if(e.code==="KeyF")attack();if(e.code==="KeyK")save();if(e.code==="KeyL")load();});
  addEventListener("keyup",e=>keys.delete(e.key));
  canvas.addEventListener("contextmenu",e=>e.preventDefault());
  canvas.addEventListener("mousedown",e=>{if(inventoryOpen)return;const r=canvas.getBoundingClientRect(),tx=Math.floor((e.clientX-r.left+renderer.cam.x)/D.TILE),ty=Math.floor((e.clientY-r.top+renderer.cam.y)/D.TILE);if(e.button===0){tryMine(tx,ty);if(!world.get(tx,ty))attack();}if(e.button===2)tryPlace(tx,ty);});
  document.querySelectorAll("[data-menu]").forEach(b=>b.onclick=()=>b.dataset.menu==="resume"?resume():menu(b.dataset.menu));
  $("saveButton").onclick=save;$("menuButton").onclick=()=>menu("main");
  ui();renderMenu("main");$("menuOverlay").classList.remove("hidden");
  function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);renderer.draw(world,mesh,player,enemies,time);requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();