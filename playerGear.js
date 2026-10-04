window.TERRPG_PLAYER_GEAR = class {
  constructor(){this.weapon="wooden blade";this.tool="copper pick";this.armor="wanderer tunic";this.armorBonus=0;this.damageBonus=0;}
  apply(itemData){
    if(!itemData)return;
    if(itemData.slot==="weapon"){this.weapon=itemData.name;this.damageBonus=itemData.damage||0;}
    if(itemData.slot==="armor"){this.armor=itemData.name;this.armorBonus=itemData.defense||0;}
  }
};