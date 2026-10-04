(() => {
  'use strict';
  const D = window.TERRPG_DATA;
  const $ = id => document.getElementById(id);
  const canvas = $('world'), ctx = canvas.getContext('2d');
  const TILE = 24, W = 420, H = 150;
  const solid = new Set(Object.keys(D.blockColors));
  const keys = new Set();
  const state = {
    world: [], player:{x:14,y:30,vx:0,vy:0,hp:100,mana:60,level:1,xp:0,damage:3,defense:0,maxHp:100,maxMana:60},
    inventory:{wood:30,dirt:50,stone:25,iron:0,coal:0,gold:0,crystal:0,potion:3,coin:25}, hotbar:['wood','dirt','stone','iron','potion','wooden sword','shield'], selected:0,
    enemies:[], chapter:0, kills:0, mined:0, placed:0, crafted:0, day:0, time:0, paused:false, view:'stats', menu:'main', achievements:[], equipped:{weapon:'wooden sword'}, seed:Math.floor(Math.random()*1e9), last:performance.now()
  };
  function rand(){ state.seed=(state.seed*1664525+1013904223)>>>0; return state.seed/4294967296; }
  function resize(){ canvas.width=Math.max(320,canvas.clientWidth*devicePixelRatio); canvas.height=Math.max(240,canvas.clientHeight*devicePixelRatio); ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); }
  addEventListener('resize',resize); resize();
  function makeWorld(){
    state.world=Array.from({length:H},()=>Array(W).fill(null));
    let surface=42;
    for(let x=0;x<W;x++){
      surface += (rand()-.5)*1.8; surface=Math.max(34,Math.min(52,surface));
      for(let y=Math.floor(surface);y<H;y++){
        let b=y===Math.floor(surface)?'grass':y<surface+7?'dirt':'stone';
        if(y>surface+25 && rand()<.035)b='coal'; if(y>surface+38 && rand()<.025)b='iron'; if(y>surface+55 && rand()<.012)b='gold'; if(y>surface+75 && rand()<.008)b='crystal';
        state.world[y][x]=b;
      }
      if(rand()<.08 && x>2 && x<W-3){ for(let ty=Math.floor(surface)-1;ty>Math.floor(surface)-5;ty--)state.world[ty][x]='wood'; for(let dx=-2;dx<=2;dx++)for(let dy=-6;dy<=-3;dy++)if(Math.abs(dx)+Math.abs(dy+4)<5)state.world[Math.floor(surface)+dy][x+dx]='leaves'; }
    }
    for(let i=0;i<650;i++){
      const cx=Math.floor(rand()*W), cy=55+Math.floor(rand()*75), rx=2+Math.floor(rand()*6), ry=2+Math.floor(rand()*4);
      for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if(x>=0&&x<W&&y>=0&&y<H&&((x-cx)/(rx||1))**2+((y-cy)/(ry||1))**2<1)state.world[y][x]=null;
    }
    spawnEnemies();
  }
  function spawnEnemies(){
    state.enemies=[];
    const types=['slime','goblin','skeleton','bandit','orc','witch','werewolf'];
    for(let i=0;i<28;i++){let x=8+Math.floor(rand()*(W-16)), y=5; while(y<H-2 && !solid.has(state.world[y+1][x]))y++; state.enemies.push({type:types[Math.floor(rand()*types.length)],x:x+.2,y:y-1,hp:0,cool:rand()*2}); const e=state.enemies.at(-1); e.hp=D.enemies[e.type][0];}
  }
  makeWorld();
  function groundY(x){x=Math.max(0,Math.min(W-1,Math.floor(x))); for(let y=0;y<H;y++)if(solid.has(state.world[y][x]))return y; return H-1;}
  state.player.y=groundY(state.player.x)-1;
  function stats(){
    let bonusHp=0,def=0,dmg=3,crit=0;
    for(const n of Object.values(state.equipped)){const it=D.items[n]; if(!it)continue; bonusHp+=it.maxHp||0; def+=it.defense||0; dmg+=it.damage||0; crit+=it.crit||0;}
    state.player.maxHp=100+bonusHp; state.player.defense=def; state.player.damage=dmg; state.player.maxMana=60; state.player.hp=Math.min(state.player.hp,state.player.maxHp);
    return {dmg,def,crit};
  }
  function add(item,n=1){state.inventory[item]=(state.inventory[item]||0)+n;}
  function spend(cost){for(const [k,n] of Object.entries(cost))if((state.inventory[k]||0)<n)return false; for(const [k,n] of Object.entries(cost))state.inventory[k]-=n; return true;}
  function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1800);}
  function save(){localStorage.setItem('terrpg-save',JSON.stringify({...state,world:state.world}));toast('Game saved.');}
  function load(){const raw=localStorage.getItem('terrpg-save');if(!raw){toast('No save found.');return} try{const s=JSON.parse(raw);Object.assign(state,s);toast('Game loaded.');renderAll()}catch{toast('Save could not be loaded.')}}
  function unlock(name){if(!state.achievements.includes(name)){state.achievements.push(name);toast('Achievement: '+name);}}
  function xp(n){state.player.xp+=n; while(state.player.xp>=state.player.level*100){state.player.xp-=state.player.level*100;state.player.level++;state.player.maxHp+=8;state.player.hp=state.player.maxHp;toast('Level '+state.player.level+'!')}}
  function mine(tx,ty){if(tx<0||ty<0||tx>=W||ty>=H)return;const b=state.world[ty][tx];if(!b)return; if(Math.hypot(tx-state.player.x,ty-state.player.y)>6)return; state.world[ty][tx]=null; state.mined++; add(b); if(b==='grass')add('dirt'); if(state.mined>=100)unlock('Miner'); if(['iron','gold','crystal'].includes(b))unlock('Treasure Hunter');}
  function place(tx,ty){const item=state.hotbar[state.selected];if(!item||!solid.has(item)||!state.inventory[item])return;if(tx<0||ty<0||tx>=W||ty>=H||state.world[ty][tx])return;if(Math.hypot(tx-state.player.x,ty-state.player.y)>6)return;state.world[ty][tx]=item;state.inventory[item]--;state.placed++;if(state.placed>=50)unlock('Builder');}
  function attack(){
    const s=stats(); let target=null,dist=99;
    for(const e of state.enemies){const d=Math.hypot(e.x-state.player.x,e.y-state.player.y);if(d<dist&&d<2.5)target=e,dist=d;}
    if(!target){toast('Nothing in range.');return} let damage=state.player.damage+Math.floor(Math.random()*5); if(Math.random()*100<s.crit)damage*=2; target.hp-=damage; toast('Hit for '+damage);
    if(target.hp<=0){state.enemies.splice(state.enemies.indexOf(target),1);state.kills++;xp(D.enemies[target.type][3]);add('coin',1+Math.floor(Math.random()*4));if(state.kills>=25)unlock('Hunter');checkChapter();}
  }
  function checkChapter(){const c=D.chapters[state.chapter];if(state.player.level>=c[1]){if(!state.chapter)unlock('Wayfarer'); if(c[2]&&state.kills<state.chapter+2)return; state.chapter=Math.min(D.chapters.length-1,state.chapter+1);toast('Chapter '+(state.chapter+1)+': '+D.chapters[state.chapter][0]);if(state.chapter===2)unlock('Godfall');if(state.chapter===10)unlock('Last Save');}}
  function craft(name){const cost=D.recipes[name];if(!cost){toast('Recipe unavailable.');return}if(!spend(cost)){toast('Not enough materials.');return}add(name);state.crafted++;if(state.crafted>=10)unlock('Crafter');toast('Crafted '+name);renderMenu('crafting');}
  function equip(name){if(!D.items[name]||!state.inventory[name])return;const slot=D.items[name].slot;state.equipped[slot]=name;stats();toast('Equipped '+name);renderMenu('character');}
  function update(dt){if(state.paused)return;state.time+=dt;if(state.time>60){state.time-=60;state.day++;} const p=state.player;
    let dir=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0); p.vx += dir*32*dt; p.vx*=Math.pow(.001,dt); p.vx=Math.max(-7,Math.min(7,p.vx));
    const grounded=solid.has(state.world[Math.min(H-1,Math.floor(p.y+1))]?.[Math.floor(p.x)]); if((keys.has(' ')||keys.has('w')||keys.has('arrowup'))&&grounded&&!p.jumpLock){p.vy=-10;p.jumpLock=true} if(!keys.has(' ')&&!keys.has('w')&&!keys.has('arrowup'))p.jumpLock=false;
    p.vy=Math.min(15,p.vy+25*dt); let nx=p.x+p.vx*dt,ny=p.y+p.vy*dt; if(!solid.has(state.world[Math.floor(p.y)]?.[Math.floor(nx)])&&nx>1&&nx<W-2)p.x=nx; if(!solid.has(state.world[Math.floor(ny+1)]?.[Math.floor(p.x)])&&ny<H-2)p.y=ny; else {p.vy=0;p.y=groundY(p.x)-1;}
    for(const e of state.enemies){e.cool-=dt; if(Math.abs(e.x-p.x)<12)e.x+=Math.sign(p.x-e.x)*dt*(1.2+(e.type==='werewolf'?1:0)); e.y=groundY(e.x)-1; if(Math.abs(e.x-p.x)<1.2&&Math.abs(e.y-p.y)<1&&e.cool<=0){e.cool=1.2;p.hp=Math.max(0,p.hp-Math.max(1,D.enemies[e.type][2]-p.defense));if(p.hp<=0){p.hp=p.maxHp;p.x=14;p.y=groundY(14)-1;toast('You respawned.');}}}
    checkChapter();
  }
  function camera(){const vw=canvas.clientWidth,vh=canvas.clientHeight;return {x:Math.max(0,Math.min(W* TILE-vw,state.player.x*TILE-vw/2)),y:Math.max(0,Math.min(H*TILE-vh,state.player.y*TILE-vh/2))};}
  function draw(){const vw=canvas.clientWidth,vh=canvas.clientHeight,c=camera();ctx.clearRect(0,0,vw,vh);const night=(state.time>38);ctx.fillStyle=night?'#14233c':'#79c6ff';ctx.fillRect(0,0,vw,vh);
    const sx=Math.floor(c.x/TILE)-1,ex=Math.ceil((c.x+vw)/TILE)+1,sy=Math.floor(c.y/TILE)-1,ey=Math.ceil((c.y+vh)/TILE)+1;
    for(let y=Math.max(0,sy);y<Math.min(H,ey);y++)for(let x=Math.max(0,sx);x<Math.min(W,ex);x++){const b=state.world[y][x];if(!b)continue;ctx.fillStyle=D.blockColors[b]||'#777';ctx.fillRect(x*TILE-c.x,y*TILE-c.y,TILE,TILE);ctx.strokeStyle='rgba(0,0,0,.15)';ctx.strokeRect(x*TILE-c.x,y*TILE-c.y,TILE,TILE);}
    for(const e of state.enemies){const px=e.x*TILE-c.x,py=e.y*TILE-c.y;ctx.fillStyle='#b63d55';ctx.beginPath();ctx.arc(px+10,py+12,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(px+5,py+8,3,3);ctx.fillRect(px+12,py+8,3,3);ctx.fillStyle='#111';ctx.fillRect(px,py-6,20,3);ctx.fillStyle='#e66';ctx.fillRect(px,py-6,20*Math.max(0,e.hp/D.enemies[e.type][0]),3);}
    const px=state.player.x*TILE-c.x,py=state.player.y*TILE-c.y;ctx.fillStyle='#f0c68a';ctx.fillRect(px+4,py+2,16,13);ctx.fillStyle='#3b6ca8';ctx.fillRect(px+2,py+15,20,13);ctx.fillStyle='#222';ctx.fillRect(px+7,py+7,3,3);ctx.fillRect(px+14,py+7,3,3);
    $('coords').textContent=Math.floor(state.player.x)+','+Math.floor(state.player.y);$('dayStatus').textContent=(night?'NIGHT':'DAY')+' '+state.day; $('hpText').textContent=Math.ceil(state.player.hp)+'/'+state.player.maxHp; $('mpText').textContent=Math.ceil(state.player.mana)+'/'+state.player.maxMana; $('hpFill').style.width=(state.player.hp/state.player.maxHp*100)+'%'; $('mpFill').style.width=(state.player.mana/state.player.maxMana*100)+'%';
  }
  function renderHotbar(){const h=$('hotbar');h.innerHTML='';state.hotbar.forEach((item,i)=>{const b=document.createElement('button');b.className='slot'+(i===state.selected?' active':'');b.innerHTML='<span>'+(i+1)+'</span>'+(D.emoji[item]||item.slice(0,1).toUpperCase())+'<b>'+(state.inventory[item]||0)+'</b>';b.onclick=()=>{state.selected=i;renderHotbar()};h.appendChild(b)});}
  function renderSide(){const el=$('sideView'), s=stats(); $('objective').textContent='Chapter '+(state.chapter+1)+': '+D.chapters[state.chapter][0]; if(state.view==='quests')el.innerHTML='<div class="card-row"><b>Current objective</b><div class="muted">Reach level '+D.chapters[state.chapter][1]+' and explore the world.</div></div><div class="card-row">Enemies defeated: '+state.kills+'</div>'; else if(state.view==='crafting')el.innerHTML='<div class="list">'+Object.keys(D.recipes).slice(0,8).map(n=>'<button class="btn" data-craft="'+n+'">Craft '+n+'</button>').join('')+'</div>'; else el.innerHTML='<div class="card-row"><b>Level '+state.player.level+'</b><div class="muted">XP '+state.player.xp+'/'+state.player.level*100+'</div></div><div class="card-row">Damage: '+s.dmg+'<br>Defense: '+s.def+'<br>HP: '+state.player.maxHp+'</div><div class="card-row">Mined: '+state.mined+'<br>Placed: '+state.placed+'</div>';
    el.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>craft(b.dataset.craft));
  }
  function renderMenu(kind=state.menu){state.menu=kind;const ov=$('menuOverlay');ov.classList.remove('hidden');state.paused=true;const box=$('menuContent');let html='';
    if(kind==='inventory')html='<div class="info"><b>Inventory</b><div class="list">'+Object.entries(state.inventory).filter(([,n])=>n>0).map(([n,v])=>'<div>'+n+': '+v+'</div>').join('')+'</div></div>';
    if(kind==='character')html='<div class="info"><b>Character</b><p>Level '+state.player.level+' · HP '+state.player.maxHp+' · Damage '+stats().dmg+' · Defense '+state.player.defense+'</p><div class="list">'+Object.keys(state.inventory).filter(n=>D.items[n]&&state.inventory[n]>0).map(n=>'<button class="btn" data-equip="'+n+'">Equip '+n+'</button>').join('')+'</div></div>';
    if(kind==='crafting')html='<div class="info"><b>Crafting</b><div class="list">'+Object.keys(D.recipes).map(n=>'<button class="btn" data-craft="'+n+'">Craft '+n+' <span class="small">'+Object.entries(D.recipes[n]).map(([k,v])=>k+'×'+v).join(', ')+'</span></button>').join('')+'</div></div>';
    if(kind==='quests')html='<div class="info"><b>Story</b><p>Chapter '+(state.chapter+1)+': '+D.chapters[state.chapter][0]+'</p><p>Reach level '+D.chapters[state.chapter][1]+(D.chapters[state.chapter][2]?' and face '+D.chapters[state.chapter][2]+'.':'.')+'</p></div>';
    if(kind==='bestiary')html='<div class="info"><b>Bestiary</b><div class="list">'+Object.keys(D.enemies).map(n=>'<div>'+n+' — '+D.enemies[n][0]+' HP</div>').join('')+'</div></div>';
    if(kind==='achievements')html='<div class="info"><b>Achievements</b><div class="list">'+D.achievements.map(a=>'<div>['+(state.achievements.includes(a[0])?'✓':' ')+'] '+a[0]+' — '+a[1]+'</div>').join('')+'</div></div>';
    if(kind==='map')html='<div class="info"><b>World Map</b><p>World size: '+W+' × '+H+' tiles.</p><p>Position: '+Math.floor(state.player.x)+', '+Math.floor(state.player.y)+'</p><p>Surface, caves, ores, trees and enemies are generated procedurally.</p></div>';
    if(kind==='settings')html='<div class="info"><b>Settings</b><button class="btn" id="resetWorld">New World</button><button class="btn" id="togglePause">Resume</button></div>';
    if(kind==='save')html='<div class="info"><button class="btn" id="doSave">Save Game</button><button class="btn" id="doLoad">Load Game</button></div>';
    if(kind==='controls')html='<div class="info"><b>Controls</b><p>A/D or arrows: move<br>W/Space: jump<br>Left click: mine<br>Right click: place selected block<br>1–7: hotbar<br>F: attack<br>Esc: menu</p></div>';
    if(kind==='main')html='<div class="info"><b>TERRPG Blockworld</b><p>An original mining, building and RPG sandbox inspired by the genre. Your progress is stored locally in this browser.</p><button class="btn" id="newGame">New Game</button></div>';
    box.innerHTML=html;
    box.querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>craft(b.dataset.craft)); box.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>equip(b.dataset.equip));
    $('doSave')?.addEventListener('click',save);$('doLoad')?.addEventListener('click',load);$('togglePause')?.addEventListener('click',()=>resume());$('newGame')?.addEventListener('click',()=>{localStorage.removeItem('terrpg-save');location.reload()});$('resetWorld')?.addEventListener('click',()=>{makeWorld();state.player.x=14;state.player.y=groundY(14)-1;resume();toast('New world generated.');});
  }
  function resume(){$('menuOverlay').classList.add('hidden');state.paused=false;}
  $('menuButton').onclick=()=>renderMenu('main'); $('saveButton').onclick=save;
  document.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>b.dataset.menu==='resume'?resume():renderMenu(b.dataset.menu));
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{state.view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));renderSide();});
  addEventListener('keydown',e=>{keys.add(e.key.toLowerCase());if(/^\d$/.test(e.key)&&+e.key>=1&&+e.key<=7){state.selected=+e.key-1;renderHotbar()}if(e.key.toLowerCase()==='f')attack();if(e.key==='Escape')state.paused?resume():renderMenu('main');});
  addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  canvas.addEventListener('mousedown',e=>{const r=canvas.getBoundingClientRect(),c=camera(),tx=Math.floor((e.clientX-r.left+c.x)/TILE),ty=Math.floor((e.clientY-r.top+c.y)/TILE);if(e.button===0)mine(tx,ty);if(e.button===2)place(tx,ty);});
  document.querySelectorAll('[data-touch]').forEach(b=>{b.onpointerdown=()=>keys.add(b.dataset.touch==='left'?'a':b.dataset.touch==='right'?'d':' ');b.onpointerup=()=>keys.delete(b.dataset.touch==='left'?'a':b.dataset.touch==='right'?'d':' ');});
  renderHotbar();renderSide();renderMenu('main');
  function loop(now){const dt=Math.min(.033,(now-state.last)/1000);state.last=now;update(dt);draw();renderSide();requestAnimationFrame(loop);}requestAnimationFrame(loop);
})();