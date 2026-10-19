import type {PointerEvent} from 'react';
// 마우스 위치에 따라 요소를 살짝 기울이는 입체 효과 (CSS 변수 --rx, --ry, --mx, --my 사용)
export function tiltMove(e:PointerEvent<HTMLElement>,max=8){
  if(e.pointerType!=='mouse')return;
  const el=e.currentTarget,b=el.getBoundingClientRect();
  const x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
  el.style.setProperty('--ry',(x*max).toFixed(2)+'deg');
  el.style.setProperty('--rx',(-y*max).toFixed(2)+'deg');
  el.style.setProperty('--mx',(x*100+50).toFixed(1)+'%');
  el.style.setProperty('--my',(y*100+50).toFixed(1)+'%');
}
export function tiltReset(e:PointerEvent<HTMLElement>){
  const el=e.currentTarget;
  el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');
}
