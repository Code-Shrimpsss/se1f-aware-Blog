'use client'

import { useEffect, useRef } from 'react'

type Props = { scene: number; stoneFocus: number }

export default function DigitalGardenCanvas({ scene, stoneFocus }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const state = useRef({ scene, stoneFocus })
  useEffect(() => { state.current.scene = scene; state.current.stoneFocus = stoneFocus }, [scene, stoneFocus])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const compact = matchMedia('(max-width: 760px)').matches
    const colors = {bg:'#111613',ground:'#171e1a',stone:'#68726a',stoneDark:'#303a34',pine:'#385947',pineLight:'#6f8f7b',paper:'#d8ddd4',red:'#bd4e3e'}
    ;(window as any).__gardenEffectMounted = true
    let W=0,H=0,DPR=1,frame=0,last=0,visual=state.current.scene,visible=true, started=false
    let pointer={x:0,y:0},target={x:0,y:0},C:any
    const sceneData=[{cam:[0,7,-17],look:[0,2,8],fog:.016},{cam:[0,13,-11],look:[0,0,4],fog:.012},{cam:[2,9,-15],look:[1,2,5],fog:.011},{cam:[-1,7,-16],look:[1,1,7],fog:.018}]
    const lerp=(a:number,b:number,t:number)=>a+(b-a)*t
    const resize=()=>{const box=canvas.getBoundingClientRect();if(box.width<2)return;DPR=Math.min(devicePixelRatio||1,compact?1.25:1.75);W=box.width;H=box.height;canvas.width=Math.round(W*DPR);canvas.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0)}
    const camera=(k:number)=>{const a=Math.floor(k),b=Math.min(3,a+1),t=k-a,A=sceneData[a],B=sceneData[b],cam=A.cam.map((v,i)=>lerp(v,B.cam[i],t)),look=A.look.map((v,i)=>lerp(v,B.look[i],t));cam[0]+=pointer.x*1.15;cam[1]-=pointer.y*.45;return{cam,look,fog:lerp(A.fog,B.fog,t)}}
    const project=(p:number[])=>{let[x,y,z]=p;const[cx,cy,cz]=C.cam,[lx,ly,lz]=C.look;x-=cx;y-=cy;z-=cz;const yaw=Math.atan2(lx-cx,lz-cz),cosy=Math.cos(-yaw),siny=Math.sin(-yaw);let x1=x*cosy-z*siny,z1=x*siny+z*cosy;const dist=Math.hypot(lx-cx,lz-cz),pitch=-Math.atan2(ly-cy,dist),cosp=Math.cos(pitch),sinp=Math.sin(pitch);let y1=y*cosp-z1*sinp,z2=y*sinp+z1*cosp;if(z2<.2)return null;const f=(compact?520:760)/z2;return[W*.5+x1*f,H*(compact?.55:.51)-y1*f,z2]}
    const fog=(hex:string,depth:number,alpha=1)=>{const f=Math.min(.82,Math.max(0,(depth-10)*C.fog)),n=parseInt(hex.slice(1),16),b=parseInt(colors.bg.slice(1),16);return`rgba(${Math.round(lerp(n>>16,b>>16,f))},${Math.round(lerp((n>>8)&255,(b>>8)&255,f))},${Math.round(lerp(n&255,b&255,f))},${alpha})`}
    const poly=(points:number[][],fill:string,stroke?:string,alpha=1)=>{const pp:any[]=points.map(project);if(pp.some(p=>!p))return;const d=pp.reduce((s,p)=>s+p[2],0)/pp.length;ctx.beginPath();ctx.moveTo(pp[0][0],pp[0][1]);pp.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fog(fill,d,alpha);ctx.fill();if(stroke){ctx.strokeStyle=fog(stroke,d,alpha);ctx.lineWidth=.65;ctx.stroke()}}
    const line=(points:number[][],color:string,alpha=1,width=1)=>{const pp:any[]=points.map(project);if(pp.some(p=>!p))return;const d=pp.reduce((s,p)=>s+p[2],0)/pp.length;ctx.beginPath();ctx.moveTo(pp[0][0],pp[0][1]);pp.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.strokeStyle=fog(color,d,alpha);ctx.lineWidth=width;ctx.stroke()}
    const box=(x:number,y:number,z:number,w:number,h:number,d:number,col=colors.stone)=>{const p={a:[x-w/2,y,z-d/2],b:[x+w/2,y,z-d/2],c:[x+w/2,y,z+d/2],d:[x-w/2,y,z+d/2],A:[x-w/2,y+h,z-d/2],B:[x+w/2,y+h,z-d/2],C:[x+w/2,y+h,z+d/2],D:[x-w/2,y+h,z+d/2]};poly([p.a,p.b,p.B,p.A],col,colors.stoneDark);poly([p.b,p.c,p.C,p.B],colors.stoneDark,colors.stoneDark);poly([p.A,p.B,p.C,p.D],col,colors.paper,.52)}
    const plane=(alpha=.16)=>{poly([[-18,0,-5],[18,0,-5],[22,0,30],[-22,0,30]],colors.ground);const step=compact?6:3;for(let x=-18;x<=18;x+=step)line([[x,.01,-3],[x,.01,30]],colors.paper,alpha,.55);for(let z=-3;z<=30;z+=step)line([[-20,.01,z],[20,.01,z]],colors.paper,alpha,.55)}
    const gate=(x:number,z:number,s=1)=>{box(x-3*s,0,z,.62*s,6*s,.62*s);box(x+3*s,0,z,.62*s,6*s,.62*s);box(x,5.55*s,z,7.4*s,.55*s,.85*s);box(x,4.75*s,z,5.8*s,.16*s,.32*s,colors.red)}
    const stone=(x:number,z:number,s=1,col=colors.stone)=>{const top=.6*s;poly([[x-s,0,z-s*.7],[x+s*.7,0,z-s*.8],[x+s,0,z+s*.3],[x+s*.3,0,z+s],[x-s*.7,0,z+s*.7]],col,colors.stoneDark);poly([[x-s,0,z-s*.7],[x+s*.7,0,z-s*.8],[x+s*.45,top,z-s*.4],[x-s*.45,top,z-s*.25]],col);poly([[x-s,0,z-s*.7],[x-s*.45,top,z-s*.25],[x-s*.25,top,z+s*.35],[x-s*.7,0,z+s*.7]],colors.stoneDark)}
    const tree=(x:number,z:number,s=1)=>{box(x,0,z,.18*s,2.5*s,.18*s,colors.stoneDark);const p:any=project([x,3*s,z]);if(!p)return;const rad=Math.max(2,80*s/p[2]);ctx.beginPath();ctx.arc(p[0],p[1],rad,0,Math.PI*2);ctx.fillStyle=fog(colors.pine,p[2],.58);ctx.fill();ctx.strokeStyle=fog(colors.pineLight,p[2],.3);ctx.stroke()}
    const corridor=(x:number,z:number,w:number,d:number,dir=0)=>{const count=Math.max(2,Math.floor((dir?d:w)/2));for(let i=0;i<=count;i++){const t=i/count;if(dir){box(x-w/2,0,z-d/2+t*d,.16,2.3,.16,colors.stoneDark);box(x+w/2,0,z-d/2+t*d,.16,2.3,.16,colors.stoneDark)}else{box(x-w/2+t*w,0,z-d/2,.16,2.3,.16,colors.stoneDark);box(x-w/2+t*w,0,z+d/2,.16,2.3,.16,colors.stoneDark)}}box(x,2.25,z,w+.5,.18,d+.5,colors.pine)}
    const s0=(a:number)=>{ctx.save();ctx.globalAlpha=a;plane();gate(0,3,1.25);gate(0,19,.72);[[-1.4,5],[1.2,8],[-.8,11],[1.1,14],[0,18]].forEach((p,i)=>stone(p[0],p[1],.75+(i%2)*.18));tree(-6,8,1.2);tree(6.5,10,.9);tree(-7,17,.8);tree(7,20,1.1);line([[0,.15,3],[0,.15,20]],colors.red,.65);ctx.restore()}
    const s1=(a:number)=>{ctx.save();ctx.globalAlpha=a;plane(.12);line([[-10,.03,8],[10,.03,8],[10,.03,21],[-10,.03,21],[-10,.03,8]],colors.paper,.4);line([[0,.04,7],[0,.04,22]],colors.red,.5);line([[-11,.04,14],[11,.04,14]],colors.paper,.35);[[-6,10,1.3],[5,10,1],[-5,18,.9],[6,18,1.15],[0,14.5,1.45]].forEach((q,i)=>{const focus=state.current.stoneFocus===i;stone(q[0],q[1],q[2]*(focus?1.35:1),focus?colors.red:(i===4?colors.pineLight:colors.stone));if(focus)line([[q[0],.8,q[1]],[q[0],4.5,q[1]]],colors.red,.75)});corridor(0,14.5,19,.8);ctx.restore()}
    const s2=(a:number)=>{ctx.save();ctx.globalAlpha=a;plane(.1);box(3,0,10,5,.45,4,colors.stoneDark);box(3,1.3,10,3.6,.35,3,colors.pineLight);box(3,2.8,10,2.6,.3,2.2,colors.paper);box(3,4.2,10,1.5,.25,1.5,colors.red);box(-6,0,15,6,.35,5);for(let x=-8;x<=-4;x+=2)for(let z=13.5;z<=16.5;z+=3)box(x,.35,z,.4,2.3,.4,colors.stoneDark);box(-6,2.65,15,6.5,.18,5.5,colors.pine);corridor(6,20,7,4);line([[3,.2,10],[-6,.2,15],[6,.2,20],[3,.2,10]],colors.red,.8,1.3);ctx.restore()}
    const s3=(a:number)=>{ctx.save();ctx.globalAlpha=a;plane(.08);gate(5,22,1);line([[0,.05,-1],[0,.05,6],[3,.05,10],[1,.05,14],[5,.05,22]],colors.red,.72,1.4);[[-4,6,2.2],[4,10,1.5],[-3,14,1.8],[4,17,1.25]].forEach((m,i)=>{box(m[0],0,m[1],m[2],.45,m[2]*.65,i===0?colors.pineLight:colors.stone);line([[m[0],.5,m[1]],[m[0],2.2+i*.25,m[1]]],i===3?colors.red:colors.paper,.5)});corridor(-7,12,1,13,1);ctx.restore()}
    const drawers=[s0,s1,s2,s3]
    const render=(t:number)=>{if(!visible)return;started=true;const dt=Math.min(40,t-last||16);last=t;visual=reduced?state.current.scene:lerp(visual,state.current.scene,1-Math.pow(.002,dt/1000));pointer.x=lerp(pointer.x,target.x,reduced?1:.045);pointer.y=lerp(pointer.y,target.y,reduced?1:.045);C=camera(visual);const g=ctx.createRadialGradient(W*.6,H*.45,0,W*.55,H*.5,Math.max(W,H)*.8);g.addColorStop(0,'#202a24');g.addColorStop(.52,'#131a16');g.addColorStop(1,colors.bg);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(let i=0;i<4;i++){const a=Math.max(0,1-Math.abs(visual-i));if(a)drawers[i](a)}if(!reduced||Math.abs(visual-state.current.scene)>.002)frame=requestAnimationFrame(render)}
    const move=(e:PointerEvent)=>{target.x=e.clientX/innerWidth-.5;target.y=e.clientY/innerHeight-.5}
    resize()
    ctx.fillStyle=colors.bg
    ctx.fillRect(0,0,W,H)
    C=camera(visual)
    s0(1)
    const ro=new ResizeObserver(resize);ro.observe(canvas);addEventListener('pointermove',move,{passive:true});const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)frame=requestAnimationFrame(render)});io.observe(canvas);resize();
    frame=requestAnimationFrame(render)
    const fallbackStart=window.setTimeout(()=>{resize();if(!started){visible=true;render(performance.now())}},120)
    return()=>{window.clearTimeout(fallbackStart);cancelAnimationFrame(frame);ro.disconnect();io.disconnect();removeEventListener('pointermove',move)}
  },[])

  return <canvas ref={canvasRef} className="garden-canvas" width={1440} height={900} aria-hidden="true" />
}
