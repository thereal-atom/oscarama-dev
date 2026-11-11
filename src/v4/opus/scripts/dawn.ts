// SC.01: the opening "drone shot". Not footage: a fragment shader of layered ridgelines at dawn,
// tracking sideways with parallax, valley fog, a low sun and an anamorphic lens streak.

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uPush;
uniform vec2 uSun;

float h1(float n){return fract(sin(n*127.1)*43758.5453);}
float n1(float x){float i=floor(x),f=fract(x);float u=f*f*(3.-2.*f);return mix(h1(i),h1(i+1.),u);}
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h2(i),h2(i+vec2(1.,0.)),u.x),mix(h2(i+vec2(0.,1.)),h2(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n2(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
float fbm1(float x){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n1(x);x=x*2.07+3.1;a*=.5;}return v;}
float crag(float x){float v=0.,a=.5;for(int i=0;i<4;i++){float n=1.-abs(n1(x)*2.-1.);v+=a*n*n;x*=2.11;a*=.5;}return v;}

vec3 sky(float y){
  vec3 top=vec3(.05,.09,.14);
  vec3 mid=vec3(.30,.33,.40);
  vec3 hor=vec3(.99,.67,.43);
  vec3 c=mix(hor,mid,smoothstep(.30,.62,y));
  return mix(c,top,smoothstep(.56,1.02,y));
}

void main(){
  vec2 frag=gl_FragCoord.xy;
  vec2 uv0=frag/uRes;
  float aspect=uRes.x/uRes.y;
  vec2 c=vec2(.6,.42);
  vec2 uv=c+(uv0-c)*(1.-.14*uPush);
  float t=uTime;
  vec2 sun=uSun;
  float y=uv.y;
  float px=1.4/uRes.y;

  vec3 col=sky(y);
  vec2 d=(uv-sun)*vec2(aspect,1.);
  float r=length(d);
  col+=vec3(1.,.62,.34)*exp(-r*3.4)*.5;
  col+=vec3(1.,.84,.6)*exp(-r*16.)*.75;
  col=mix(col,vec3(1.,.97,.9),smoothstep(.034+px,.034-px,r));

  // high cloud streaks catching first light
  float cl=fbm(vec2(uv.x*aspect*1.3+t*.006,uv.y*13.));
  col=mix(col,col*1.22+vec3(.1,.05,.03),smoothstep(.55,.8,cl)*smoothstep(.46,.8,y)*.5);

  // six ridgelines, far to near, each tracking at its own speed
  for(int i=0;i<6;i++){
    float fi=float(i);
    float k=fi/5.;
    float speed=mix(.004,.07,k*k);
    float freq=mix(3.2,1.25,k)*aspect*.42;
    float base=mix(.43,.04,k);
    float amp=mix(.10,.30,k);
    float x=uv.x*freq+t*speed+fi*17.3;
    float shape=.72*fbm1(x)+.55*crag(x*1.7+5.);
    float h=base+amp*(shape-.55);
    float edge=smoothstep(-px,px,h-y);
    float depthIn=clamp((h-y)/(amp+.1),0.,1.);
    vec3 haze=sky(h)*vec3(.82,.78,.86);
    vec3 rock=mix(haze,vec3(.012,.03,.038),pow(k,.5));
    vec3 fogc=mix(vec3(.93,.70,.55),vec3(.18,.28,.32),pow(k,.8));
    float mist=fbm(vec2(uv.x*aspect*1.6+t*speed*3.,y*5.-fi*2.));
    float fogAmt=depthIn*(.3+.6*mist)*(1.-k*.62);
    vec3 layer=mix(rock,fogc,clamp(fogAmt,0.,1.));
    float crest=exp(-max(h-y,0.)*170.);
    layer+=vec3(1.,.66,.36)*crest*exp(-abs(d.x)*1.3)*(1.-k*.5)*.6;
    layer+=vec3(.95,.55,.3)*exp(-r*2.4)*(1.-k)*.25;
    col=mix(col,layer,edge);
  }

  // drifting valley mist
  float band=fbm(vec2(uv.x*aspect*.8-t*.03,uv.y*7.+t*.012));
  col=mix(col,vec3(.74,.62,.56),smoothstep(.48,.85,band)*smoothstep(.36,.0,y)*.42);

  // anamorphic streak: a thin blue line across the frame, hottest at the sun
  float sy=abs(uv0.y-sun.y);
  float line=exp(-sy*uRes.y*.09);
  col+=vec3(.42,.66,1.)*line*(.12+.9*exp(-abs(d.x)*1.1));
  col+=vec3(.32,.5,1.)*exp(-sy*uRes.y*.016)*exp(-abs(d.x)*2.2)*.18;
  vec2 gpos=vec2(1.)-sun;
  for(int j=1;j<4;j++){
    float fj=float(j);
    vec2 gp=mix(sun,gpos,.32*fj);
    float gr=length((uv0-gp)*vec2(aspect,1.));
    col+=vec3(.3,.55,.95)*smoothstep(.03*fj,.0,gr)*.06;
  }

  // grade: teal shadows, warm highlights, soft shoulder
  float l=dot(col,vec3(.299,.587,.114));
  col+=vec3(-.012,.008,.02)*(1.-l);
  col=max(col,0.);
  col=col/(1.+col*.16);

  vec2 q=uv0-.5;
  col*=1.-(q.x*q.x*.75+q.y*q.y*.55);
  col+=(h2(frag+fract(t*7.)*91.)-.5)*.045;
  col*=.988+.012*sin(t*47.);
  gl_FragColor=vec4(col,1.);
}`;

export function mountDawn(canvas: HTMLCanvasElement, host: HTMLElement) {
  const gl = canvas.getContext("webgl", {
    antialias: false,
    alpha: false,
    depth: false,
    powerPreference: "low-power",
  });
  if (!gl) return false;

  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return false;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "uRes");
  const uTime = gl.getUniformLocation(prog, "uTime");
  const uPush = gl.getUniformLocation(prog, "uPush");
  const uSun = gl.getUniformLocation(prog, "uSun");

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 640px)").matches;
  // render soft: half-res reads as lens, saves the battery
  const scale = Math.min(devicePixelRatio || 1, 2) * (small ? 0.6 : 0.7);

  let w = 0;
  let h = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = Math.max(2, Math.round(r.width * scale));
    h = Math.max(2, Math.round(r.height * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };

  const start = performance.now();
  const T0 = 42;
  let visible = true;
  let raf = 0;
  const draw = (now: number) => {
    const t = reduce ? T0 : T0 + (now - start) / 1000;
    const rect = host.getBoundingClientRect();
    const push = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
    const aspect = w / h;
    gl.uniform2f(uRes, w, h);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uPush, reduce ? 0 : push);
    gl.uniform2f(uSun, aspect < 1 ? 0.6 : 0.64, aspect < 1 ? 0.38 : 0.41);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  const loop = (now: number) => {
    raf = 0;
    if (!visible || document.hidden) return;
    draw(now);
    if (!reduce) raf = requestAnimationFrame(loop);
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };

  resize();
  draw(performance.now());
  canvas.classList.add("is-live");
  kick();

  new ResizeObserver(() => {
    resize();
    if (reduce) draw(performance.now());
  }).observe(canvas);
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  }).observe(host);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) kick();
  });
  return true;
}
