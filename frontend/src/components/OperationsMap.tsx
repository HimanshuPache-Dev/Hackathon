import { useEffect, useRef, useState } from 'react';
import maplibregl, { LngLatBounds, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Junction, Officer } from '../types';

const mapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-saturation': -0.72, 'raster-brightness-max': 0.55, 'raster-contrast': 0.18 } }],
};

export default function OperationsMap({ junctions, officers, selectedId, onSelect }:{ junctions:Junction[]; officers:Officer[]; selectedId?:string; onSelect:(junction:Junction)=>void }) {
  const host = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map>();
  const markersRef = useRef<Marker[]>([]);
  const [status, setStatus] = useState<'loading'|'ready'|'error'>('loading');

  useEffect(() => {
    if (!host.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: host.current, center: [79.0882, 21.1458], zoom: 11.2, minZoom: 9, maxZoom: 18, style: mapStyle, attributionControl: false });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.on('load', () => setStatus('ready'));
    map.on('error', () => setStatus('error'));
    mapRef.current = map;
    return () => { markersRef.current.forEach(marker=>marker.remove()); map.remove(); mapRef.current=undefined; };
  }, []);

  useEffect(() => {
    const map = mapRef.current; if (!map) return;
    const draw = () => {
      markersRef.current.forEach(marker => marker.remove()); markersRef.current = [];
      const bounds = new LngLatBounds();
      junctions.forEach(junction => {
        const element = document.createElement('button');
        element.className = `junction-marker marker-${junction.current_risk_level.toLowerCase()} ${selectedId===junction.id?'selected':''}`;
        element.setAttribute('aria-label', `${junction.name}, risk ${junction.current_risk_score}`);
        element.innerHTML = `<span>${Math.round(junction.current_risk_score)}</span>`;
        element.onclick = () => onSelect(junction);
        const popup = new maplibregl.Popup({ offset: 22, closeButton: false }).setHTML(`<strong>${junction.name}</strong><small>${junction.current_risk_level} · ${junction.is_unmanned?'Unmanned':`${junction.assigned_officers} deployed`}</small>`);
        markersRef.current.push(new Marker({ element }).setLngLat([Number(junction.longitude), Number(junction.latitude)]).setPopup(popup).addTo(map));
        bounds.extend([Number(junction.longitude), Number(junction.latitude)]);
      });
      officers.filter(o=>o.latitude!=null&&o.longitude!=null).forEach(officer => {
        const element=document.createElement('div'); element.className=`officer-map-marker status-${officer.status.toLowerCase()}`; element.title=`${officer.badge_code} · ${officer.status}`;
        markersRef.current.push(new Marker({element}).setLngLat([Number(officer.longitude),Number(officer.latitude)]).addTo(map));
      });
      if (!bounds.isEmpty()) map.fitBounds(bounds,{padding:55,maxZoom:12,duration:800});
    };
    map.loaded() ? draw() : map.once('load', draw);
  }, [junctions, officers, selectedId, onSelect]);

  return <div className="map-wrap"><div ref={host} className="map-host" aria-label="Interactive live map of Nagpur traffic junctions"/>{status==='loading'&&<div className="map-state">Loading operational map…</div>}{status==='error'&&<div className="map-state error">Map tiles are unavailable. Junction data remains available in the priority list.</div>}<div className="map-label"><span className="live-dot"/>LIVE SUPABASE DATA</div></div>;
}
