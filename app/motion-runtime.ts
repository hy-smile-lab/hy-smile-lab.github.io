type XY={x:number;y:number};
const routes:Record<string,number[]>={"traffic1": [418, 382, 478, 484], "traffic2": [570, 737, 632, 857], "traffic3": [992, 235, 1194, 113], "traffic4": [1182, 447, 1106, 423], "traffic5": [115, 606, 208, 615], "traffic6": [950, 887, 979, 782], "traffic7": [560, 1238, 663, 1147], "walk1": [803, 482, 732, 528], "walk2": [1004, 361, 1065, 347], "walk3": [1031, 363, 1091, 349], "walk4": [377, 470, 417, 535], "walk5": [1078, 754, 1160, 778], "walk6": [342, 709, 430, 720]};
export function mountMotion(root:HTMLElement){
 const find=(id:string)=>root.querySelector<SVGElement>('[id="'+id+'"]');
 const actors=Array.from(root.querySelectorAll<SVGGElement>('.road-sprite')).map(el=>({el,route:routes[el.dataset.route!],duration:Number(el.dataset.duration),phase:Number(el.dataset.phase),car:el.dataset.kind==='car',position:{x:0,y:0}}));
 let raf=0,stopped=false,start:number|undefined;
 function point(a:XY,b:XY,c:XY,t:number):XY{return {x:(1-t)*(1-t)*a.x+2*(1-t)*t*b.x+t*t*c.x,y:(1-t)*(1-t)*a.y+2*(1-t)*t*b.y+t*t*c.y}}
 function connection(id:string,from:XY,to:XY,bend:number,time:number){
  const dx=to.x-from.x,dy=to.y-from.y,len=Math.max(1,Math.hypot(dx,dy)),nx=-dy/len,ny=dx/len;
  const a={x:from.x+dx/len*29,y:from.y+dy/len*29},c={x:to.x-dx/len*24,y:to.y-dy/len*24},b={x:(a.x+c.x)/2+nx*bend,y:(a.y+c.y)/2+ny*bend};
  find(id+'-line')?.setAttribute('d',`M${a.x} ${a.y} Q${b.x} ${b.y} ${c.x} ${c.y}`);
  for(const [suffix,t] of [['a',(time/3.4)%1],['b',1-(time/3.4)%1]] as const){const p=point(a,b,c,t),dot=find(id+'-dot-'+suffix);dot?.setAttribute('cx',String(p.x));dot?.setAttribute('cy',String(p.y))}
 }
 function draw(time:number){
  for(const a of actors){if(!a.route)continue;const phase=(time/a.duration+a.phase)%1,t=a.car?phase:(1-Math.cos(phase*Math.PI*2))/2;const [x1,y1,x2,y2]=a.route;a.position={x:x1+(x2-x1)*t,y:y1+(y2-y1)*t};const angle=Math.atan2(y2-y1,x2-x1)*180/Math.PI+90;const bob=a.car?0:Math.sin(time*5+a.phase*8)*.8;a.el.setAttribute('transform',`translate(${a.position.x} ${a.position.y+bob})${a.car?' rotate('+angle+')':''}`);a.el.style.opacity='1'}
  const a=actors.find(a=>a.el.dataset.route==='traffic1'),b=actors.find(a=>a.el.dataset.route==='traffic2');if(a&&b){connection('v2v',a.position,b.position,32,time);connection('v2i',a.position,{x:568,y:534},-18,time)}
 }
 function tick(now:number){if(stopped)return;if(start===undefined)start=now;draw((now-start)/1000);raf=window.requestAnimationFrame(tick)}
 draw(0);raf=window.requestAnimationFrame(tick);
 return ()=>{stopped=true;window.cancelAnimationFrame(raf)};
}
