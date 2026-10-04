window.TERRPG_DATA = {
  TILE:24,WORLD_W:700,WORLD_H:220,
  blocks:{
    air:{id:0,name:"Air",solid:false,color:[0,0,0]},
    grass:{id:1,name:"Verdant Soil",solid:true,color:[.25,.67,.30],hardness:1,drop:"dirt"},
    dirt:{id:2,name:"Earth",solid:true,color:[.48,.30,.16],hardness:1},
    stone:{id:3,name:"Slate",solid:true,color:[.40,.43,.47],hardness:2},
    wood:{id:4,name:"Timber",solid:true,color:[.50,.31,.15],hardness:1},
    leaf:{id:5,name:"Canopy",solid:true,color:[.16,.52,.23],hardness:.5},
    coal:{id:6,name:"Coal",solid:true,color:[.10,.11,.13],hardness:3},
    copper:{id:7,name:"Copper",solid:true,color:[.72,.34,.16],hardness:3},
    iron:{id:8,name:"Iron",solid:true,color:[.63,.67,.72],hardness:3},
    crystal:{id:9,name:"Prism Crystal",solid:true,color:[.30,.78,.82],hardness:4},
    brick:{id:10,name:"Sunbrick",solid:true,color:[.62,.30,.20],hardness:2},
    torch:{id:11,name:"Torch",solid:false,color:[.92,.55,.14]}
  },
  items:{
    dirt:{name:"Earth",place:"dirt"},stone:{name:"Slate",place:"stone"},wood:{name:"Timber",place:"wood"},brick:{name:"Sunbrick",place:"brick"},torch:{name:"Torch",place:"torch"},
    coal:{name:"Coal"},copper:{name:"Copper"},iron:{name:"Iron"},crystal:{name:"Prism Crystal"},
    "wooden blade":{name:"Wooden Blade",slot:"weapon",damage:7}, "copper pick":{name:"Copper Pick",slot:"tool",minePower:3},
    "wanderer tunic":{name:"Wanderer Tunic",slot:"armor",defense:2}
  },
  recipes:{
    "wooden blade":{wood:5},"copper pick":{wood:6,copper:8},"wanderer tunic":{wood:12},"brick":{stone:4},"torch":{wood:1,coal:1}
  },
  enemyTypes:{
    crawler:{hp:34,speed:1.0,damage:7,color:[.70,.22,.28],xp:16},
    hopper:{hp:48,speed:1.25,damage:9,color:[.63,.28,.58],xp:22},
    stalker:{hp:76,speed:1.45,damage:12,color:[.26,.34,.52],xp:40}
  }
};