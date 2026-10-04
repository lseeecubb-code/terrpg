window.TERRPG_DATA = (() => {
  const items = {
    'wooden sword': { slot:'weapon', damage:3 }, 'iron sword': { slot:'weapon', damage:9 }, 'steel sword': { slot:'weapon', damage:12, crit:4 },
    'ember blade': { slot:'weapon', damage:14, crit:8 }, 'frost sword': { slot:'weapon', damage:15, parry:5 }, 'fire sword': { slot:'weapon', damage:16, crit:5 },
    'soul scythe': { slot:'weapon', damage:18, crit:12 }, 'greatsword': { slot:'weapon', damage:20 }, 'demon sword': { slot:'weapon', damage:20, crit:8 },
    'dragon slayer': { slot:'weapon', damage:24, crit:7 }, 'ancient blade': { slot:'weapon', damage:27, crit:12 }, 'void weapon': { slot:'weapon', damage:30, crit:15 },
    'stone axe': { slot:'weapon', damage:7 }, 'axe': { slot:'weapon', damage:10 }, 'iron axe': { slot:'weapon', damage:11 }, 'battle axe': { slot:'weapon', damage:15 },
    'warhammer': { slot:'weapon', damage:15 }, 'thunder hammer': { slot:'weapon', damage:24 }, 'spear': { slot:'weapon', damage:8 }, 'dragon spear': { slot:'weapon', damage:23 },
    'longbow': { slot:'weapon', damage:7, crit:8 }, 'dragon bow': { slot:'weapon', damage:23, crit:12 }, 'dagger': { slot:'weapon', damage:3, crit:10 },
    'poison dagger': { slot:'weapon', damage:8, crit:12 }, 'shadow blade': { slot:'weapon', damage:21, crit:14 }, 'mage staff': { slot:'weapon', damage:9 },
    'cloth armor': { slot:'armor', maxHp:10, defense:1 }, 'leather armor': { slot:'armor', maxHp:25, defense:2 }, 'chainmail': { slot:'armor', maxHp:50, defense:4 },
    'iron armor': { slot:'armor', maxHp:65, defense:5 }, 'steel armor': { slot:'armor', maxHp:60, defense:4 }, 'knight armor': { slot:'armor', maxHp:80, defense:6 },
    'flame armor': { slot:'armor', maxHp:70, defense:5 }, 'frost armor': { slot:'armor', maxHp:75, defense:6 }, 'dragon armor': { slot:'armor', maxHp:75, defense:6 },
    'dragonscale armor': { slot:'armor', maxHp:120, defense:9 }, 'shadow armor': { slot:'armor', maxHp:55, defense:3 }, 'mystic robe': { slot:'armor', maxHp:30, defense:2 },
    'guardian armor': { slot:'armor', maxHp:100, defense:8 }, 'demon armor': { slot:'armor', maxHp:90, defense:7 }, 'shield': { slot:'offhand', maxHp:25, defense:2 },
    'dragon shield': { slot:'offhand', maxHp:45, defense:4 }, 'helmet': { slot:'head', maxHp:15, defense:1 }, 'crown': { slot:'head', maxHp:20, crit:10 },
    'boots': { slot:'feet', maxHp:5 }, 'wind boots': { slot:'feet', maxHp:8 }, 'dragon boots': { slot:'feet', maxHp:15 }, 'charm': { slot:'trinket', maxHp:10, crit:8 },
    'first shard': { slot:'trinket', maxHp:25, crit:5 }, 'godslayer relic': { slot:'trinket', damage:8, maxHp:50, crit:8 },
    'fractured crown': { slot:'head', maxHp:80, defense:5 }, 'edgewalker': { slot:'weapon', damage:38, crit:20 }, 'last light': { slot:'weapon', damage:45, crit:25 }
  };
  const recipes = {
    'wooden sword': { wood:5 }, 'iron sword': { iron:8, wood:3 }, 'steel sword': { iron:12, coal:2, wood:4 },
    'fire sword': { steel:6, 'ember core':2 }, 'dragon slayer': { steel:8, 'dragon scale':3, 'dragon bone':2 },
    'iron armor': { iron:16, leather:4 }, 'steel armor': { iron:12, coal:3, leather:4 }, 'flame armor': { steel:10, 'ember core':3, crystal:2 },
    'dragon armor': { iron:20, leather:5, scale:2 }, shield: { iron:8, wood:2 }, 'dragon shield': { iron:15, scale:2, leather:2 },
    potion: { wood:3, coin:10 }, 'greater potion': { wood:5, bone:2, coin:25 }
  };
  const enemies = {
    slime:[30,3,6,15], goblin:[35,4,8,20], skeleton:[55,7,11,34], orc:[75,9,14,55], bandit:[60,7,12,52], witch:[70,6,10,68],
    werewolf:[90,10,15,90], ogre:[150,16,24,150], wraith:[100,12,18,145], lich:[180,16,24,230], 'stone golem':[170,15,23,210],
    dragon:[260,22,32,400], 'ancient dragon':[420,30,45,800], wyvern:[210,20,30,360], demon:[220,21,31,430], 'frost giant':[300,24,35,520],
    'the unnamed king':[850,48,66,2200], 'the leftover':[900,50,70,2400], 'the watcher':[1000,52,72,2800], 'the witness':[1150,56,78,3200],
    'the archivist':[1350,60,84,3800], 'the first hero':[1500,65,90,4400], 'the editor':[1700,70,96,5000], 'the author':[1850,74,102,5800], 'the last save':[2200,84,116,7000]
  };
  const chapters = [
    ['The Quiet Road',2,null], ['The Broken Frontier',4,null], ['The Cathedral of Ash',6,'the unnamed king'], ['The Null Expanse',8,'the leftover'],
    ['The Unfinished Room',10,'the watcher'], ['Outside the World',12,'the witness'], ['The Archive of Attempts',14,'the archivist'], ['The Hollow Kingdom',16,'the first hero'],
    ['The Margin',18,'the editor'], ['The Blank Page',20,'the author'], ['The Last Autosave',22,'the last save']
  ];
  const achievements = [
    ['First Steps','Start a world'], ['Treasure Hunter','Collect valuable ore'], ['Miner','Mine 100 blocks'], ['Builder','Place 50 blocks'],
    ['Hunter','Defeat 25 enemies'], ['Crafter','Craft 10 items'], ['Wayfarer','Reach the Broken Frontier'], ['Godfall','Defeat the Unnamed King'],
    ['Worldbreaker','Reach the final chapter'], ['Archivist','Discover the archive'], ['Editor','Defeat the Editor'], ['Last Save','Reach the Last Autosave']
  ];
  const companions = ['Mira','Bellkeeper','The Witness','The Archivist','The First Hero'];
  const blockColors = { grass:'#58a54c', dirt:'#8a5735', stone:'#777b82', wood:'#9b6639', leaves:'#3f963c', coal:'#30343a', iron:'#aeb5bd', gold:'#e2ba48', crystal:'#65d6d0', obsidian:'#272735' };
  const emoji = { dirt:'🟫', stone:'⬜', wood:'🪵', leaves:'🍃', coal:'⚫', iron:'🔘', gold:'🟨', crystal:'💎', obsidian:'⬛', torch:'🔦', 'wooden sword':'🗡️', potion:'🧪', shield:'🛡️' };
  return { items, recipes, enemies, chapters, achievements, companions, blockColors, emoji };
})();