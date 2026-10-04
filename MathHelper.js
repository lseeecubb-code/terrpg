window.TERRPG_MATH = (() => {
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=t=>t*t*(3-2*t);
  const hash=(x,y,seed=0)=>{
    const n=Math.sin(x*127.1+y*311.7+seed*0.001)*43758.5453123;
    return n-Math.floor(n);
  };
  function noise2(x,y,seed){
    const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,u=smooth(fx),v=smooth(fy);
    const a=hash(x0,y0,seed),b=hash(x0+1,y0,seed),c=hash(x0,y0+1,seed),d=hash(x0+1,y0+1,seed);
    return lerp(lerp(a,b,u),lerp(c,d,u),v);
  }
  return {clamp,lerp,smooth,hash,noise2};
})();