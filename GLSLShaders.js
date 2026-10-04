window.TERRPG_SHADERS = {
  worldV: `#version 300 es
  precision highp float;
  layout(location=0) in vec2 aPos;
  layout(location=1) in vec4 aColor;
  uniform mat3 uView;
  out vec4 vColor;
  void main(){
    vec3 p=uView*vec3(aPos,1.0);
    gl_Position=vec4(p.xy,0.0,1.0);
    vColor=aColor;
  }`,
  worldF: `#version 300 es
  precision mediump float;
  in vec4 vColor;
  out vec4 outColor;
  void main(){ outColor=vColor; }`
};