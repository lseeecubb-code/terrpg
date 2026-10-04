window.TERRPG_RENDERER = class {
  constructor(canvas,shaders,data){
    this.canvas=canvas;this.data=data;this.gl=canvas.getContext("webgl2",{antialias:false});
    if(!this.gl)throw new Error("WebGL2 is required.");
    const gl=this.gl,S=shaders,compile=(type,src)=>{const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;};
    const p=gl.createProgram();gl.attachShader(p,compile(gl.VERTEX_SHADER,S.worldV));gl.attachShader(p,compile(gl.FRAGMENT_SHADER,S.worldF));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error("Program link failed");
    this.program=p;this.bufV=gl.createBuffer();this.bufC=gl.createBuffer();this.uView=gl.getUniformLocation(p,"uView");this.cam={x:0,y:0};
  }
  resize(){const d=Math.min(devicePixelRatio||1,2),w=Math.max(320,Math.floor(this.canvas.clientWidth*d)),h=Math.max(240,Math.floor(this.canvas.clientHeight*d));if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}}
  matrix(){const gl=this.gl,w=this.canvas.clientWidth,h=this.canvas.clientHeight;const l=-1,r=1,b=-1,t=1,sx=2/(w),sy=-2/(h);return new Float32Array([sx,0,0,0,sy,0,0,0,1]).map((v,i)=>v);}
  draw(world,mesh,player,enemies,time){
    this.resize();const gl=this.gl,w=this.canvas.width,h=this.canvas.height;gl.viewport(0,0,w,h);
    const day=(Math.sin(time*Math.PI*2/180-Math.PI/2)+1)/2;gl.clearColor(.07+.18*day,.10+.28*day,.17+.48*day,1);gl.clear(gl.COLOR_BUFFER_BIT);
    const cw=this.canvas.clientWidth,ch=this.canvas.clientHeight;mesh.build(Math.max(0,Math.floor(this.cam.x/world.data.TILE)-1),Math.max(0,Math.floor(this.cam.y/world.data.TILE)-1),Math.min(world.w,Math.ceil((this.cam.x+cw)/world.data.TILE)+1),Math.min(world.h,Math.ceil((this.cam.y+ch)/world.data.TILE)+1),(x,y)=>1);
    const sx=2/cw,sy=-2/ch;
    const m=new Float32Array([sx,0,0,sy,0,0,0,0,1]);gl.useProgram(this.program);gl.uniformMatrix3fv(this.uView,false,m);
    const tx=world.data.TILE;
    const shiftX=-this.cam.x,shiftY=-this.cam.y;
    const shifted=new Float32Array(mesh.vertices.length);
    for(let i=0;i<mesh.vertices.length;i++)shifted[i]=mesh.vertices[i]+(i%2?shiftY:shiftX);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bufV);gl.bufferData(gl.ARRAY_BUFFER,shifted,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,this.bufC);gl.bufferData(gl.ARRAY_BUFFER,mesh.colors,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,4,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,shifted.length/2);
    this.drawActors(player,enemies);
  }
  drawActors(player,enemies){
    const gl=this.gl,w=this.canvas.clientWidth,h=this.canvas.clientHeight,verts=[],cols=[],push=(x,y,ww,hh,c)=>{verts.push(x,y,x+ww,y,x,y+hh,x,y+hh,x+ww,y,x+ww,y+hh);for(let i=0;i<6;i++)cols.push(...c);};
    const sx=2/w,sy=-2/h;
    push(player.x*this.data.TILE-this.cam.x-9,player.y*this.data.TILE-this.cam.y-28,18,28,[.2,.55,.82,1]);
    for(const e of enemies)push(e.x*this.data.TILE-this.cam.x,e.y*this.data.TILE-this.cam.y-20,20,20,e.color);
    const v=new Float32Array(verts),c=new Float32Array(cols);gl.bindBuffer(gl.ARRAY_BUFFER,this.bufV);gl.bufferData(gl.ARRAY_BUFFER,v,gl.DYNAMIC_DRAW);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,this.bufC);gl.bufferData(gl.ARRAY_BUFFER,c,gl.DYNAMIC_DRAW);gl.vertexAttribPointer(1,4,gl.FLOAT,false,0,0);gl.drawArrays(gl.TRIANGLES,0,v.length/2);
  }
};