'use client';
import {useEffect,useRef} from 'react';
import scene from '../public/motion-scene.json';
import {mountMotion} from './motion-runtime';
export default function Network(){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(ref.current)return mountMotion(ref.current)},[]);return <div ref={ref} className="hy-map-motion" dangerouslySetInnerHTML={{__html:scene.markup}}/>}
