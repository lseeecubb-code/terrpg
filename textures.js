window.TERRPG_TEXTURES = class {
  constructor(){this.canvas=document.createElement("canvas");this.canvas.width=16;this.canvas.height=16;this.ctx=this.canvas.getContext("2d");}
  swatch(color){this.ctx.clearRect(0,0,16,16);this.ctx.fillStyle=color;this.ctx.fillRect(0,0,16,16);this.ctx.fillStyle="rgba(255,255,255,.10)";this.ctx.fillRect(0,0,16,3);this.ctx.fillStyle="rgba(0,0,0,.10)";this.ctx.fillRect(0,13,16,3);return this.canvas.toDataURL();}
};