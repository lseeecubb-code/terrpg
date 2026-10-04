window.TERRPG_WORLD = class {
  constructor(data,seed){this.data=data;this.w=data.WORLD_W;this.h=data.WORLD_H;this.seed=seed>>>0;this.cells=new Uint8Array(this.w*this.h);}
  idx(x,y){return y*this.w+x;}
  get(x,y){if(x<0||x>=this.w||y<0||y>=this.h)return 3;return this.cells[this.idx(x,y)];}
  set(x,y,v){if(x>=0&&x<this.w&&y>=0&&y<this.h)this.cells[this.idx(x,y)]=v;}
  generate(){
    const M=window.TERRPG_MATH,blocks=this.data.blocks;
    this.cells.fill(0);
    for(let x=0;x<this.w;x++){
      const n=M.noise2(x*.018,0,this.seed)*.55+M.noise2(x*.055,12,this.seed)*.30+M.noise2(x*.13,24,this.seed)*.15;
      const surface=Math.floor(44+n*24);
      for(let y=surface;y<this.h;y++){
        this.set(x,y,y===surface?blocks.grass.id:y<surface+7?blocks.dirt.id:blocks.stone.id);
      }
      if(M.hash(x,99,this.seed)>.91){
        const trunk=4+Math.floor(M.hash(x,100,this.seed)*3);
        for(let y=1;y<=trunk;y++)this.set(x,surface-y,blocks.wood.id);
        const top=surface-trunk;
        for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=1;dy++)if(Math.abs(dx)+Math.abs(dy)<4)this.set(x+dx,top+dy,blocks.leaf.id);
      }
    }
    for(let i=0;i<1250;i++){
      const cx=4+Math.floor(M.hash(i,2,this.seed)* (this.w-8)),cy=50+Math.floor(M.hash(i,3,this.seed)*(this.h-58));
      const rx=2+Math.floor(M.hash(i,4,this.seed)*7),ry=2+Math.floor(M.hash(i,5,this.seed)*5);
      for(let y=cy-ry;y<=cy+ry;y++)for(let x=cx-rx;x<=cx+rx;x++)if(((x-cx)/(rx||1))**2+((y-cy)/(ry||1))**2<1)this.set(x,y,0);
    }
    const ores=[[blocks.coal.id,.985,24],[blocks.copper.id,.968,42],[blocks.iron.id,.952,62],[blocks.crystal.id,.975,92]];
    for(let x=1;x<this.w-1;x++)for(let y=55;y<this.h-2;y++)if(this.get(x,y)===blocks.stone.id){
      const r=M.hash(x*7,y*13,this.seed);for(const [id,p,depth] of ores)if(y>depth&&r>p){this.set(x,y,id);break;}
    }
  }
  surfaceY(x){x=Math.max(0,Math.min(this.w-1,Math.floor(x)));for(let y=0;y<this.h;y++)if(this.get(x,y)!==0)return y;return this.h-1;}
  serialize(){return {w:this.w,h:this.h,seed:this.seed,cells:Array.from(this.cells)};}
  load(o){this.w=o.w;this.h=o.h;this.seed=o.seed;this.cells=new Uint8Array(o.cells);}
};