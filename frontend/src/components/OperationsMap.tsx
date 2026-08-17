import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Junction, Officer } from '../types';
export default function OperationsMap({junctions,officers,onSelect}:{junctions:Junction[];officers:Officer[];onSelect:(junction:Junction)=>void}) {
  const host=useRef<HTMLDivElement>(null); const mapRef=useRef<maplibregl.Map>();
  useEffect(()=>{ if(!host.current||mapRef.current)return; const map=new maplibregl.Map({container:host.current,center:[79.0882,21.1458],zoom:11,style:'https://demotiles.maplibre.org/style.json'}); map.addControl(new maplibregl.NavigationControl(),'top-right'); mapRef.current=map; return()=>{map.remove();mapRef.current=undefined};},[]);
  useEffect(()=>{ const map=mapRef.current;if(!map)return; const draw=()=>{ document.querySelectorAll('.safeflow-marker').forEach((node)=>node.remove()); junctions.forEach((j)=>{const el=document.createElement('button');el.className=`safeflow-marker marker-${j.current_risk_level.toLowerCase()}`;el.title=`${j.name}: ${j.current_risk_score}`;el.onclick=()=>onSelect(j);new maplibregl.Marker({element:el}).setLngLat([j.longitude,j.latitude]).addTo(map)}); officers.filter(o=>o.latitude&&o.longitude).forEach((o)=>{const el=document.createElement('div');el.className='safeflow-marker officer-marker';el.title=`${o.badge_code} · ${o.status}`;new maplibregl.Marker({element:el}).setLngLat([o.longitude!,o.latitude!]).addTo(map)}); }; map.loaded()?draw():map.once('load',draw);},[junctions,officers,onSelect]);
  return <div ref={host} className="map-host" aria-label="Live map of Nagpur traffic junctions"/>;
}
