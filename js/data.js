window.TERRPG_DATA={
  player:{speed:0.16,jump:0.22,maxHp:100,zoom:1.35},
  world:{width:180,depth:70,groundY:0},
  enemies:[
    {id:'slime',name:'Moss Slime',hp:35,speed:.045,range:3,behavior:'hop',color:'#77b85b'},
    {id:'wisp',name:'Blue Wisp',hp:55,speed:.055,range:9,behavior:'orbit',color:'#73b9e8'},
    {id:'crawler',name:'Stone Crawler',hp:80,speed:.035,range:2,behavior:'chase',color:'#9b795b'}
  ],
  skills:[
    {id:'basic',name:'Strike',cooldown:.35,power:12,target:'nearest'},
    {id:'burst',name:'Arc Burst',cooldown:2.5,power:26,target:'nearby'},
    {id:'nova',name:'Star Nova',cooldown:7,power:48,target:'area'}
  ],
  content:{
    source:'rpg-game',
    note:'RPG data is being adapted into the WebGL 2.5D runtime; presentation and assets are original.'
  }
};
