window.TERRPG_MAP_MESH = class {
  constructor(world,types,tile){this.world=world;this.types=types;this.tile=tile;this.vertices=new Float32Array(0);this.colors=new Float32Array(0);}
  build(x0,y0,x1,y1,lighting){
    const v=[],c=[],w=this.world.w,h=this.world.h;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){
      const id=this.world.get(x,y); if(id===0) continue;
      const t=this.types[id], sx=x*this.tile, sy=y*this.tile;
      const shade=Math.max(.18,lighting(x,y));
      const col=[t.color[0]*shade,t.color[1]*shade,t.color[2]*shade,1];
      v.push(sx,sy,sx+this.tile,sy,sx,sy+this.tile,sx,sy+this.tile,sx+this.tile,sy,sx+this.tile,sy+this.tile);
      for(let i=0;i<6;i++) c.push(...col);
    }
    this.vertices=new Float32Array(v);this.colors=new Float32Array(c);
  }
};