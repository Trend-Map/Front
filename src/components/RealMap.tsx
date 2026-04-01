import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Place } from '../types';

// Fix default marker icon broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const STATUS_COLOR: Record<Place['availabilityStatus'], string> = {
  available: '#16a34a',
  soldout: '#dc2626',
  low_stock: '#d97706',
  unknown: '#94a3b8',
};

const STATUS_LABEL: Record<Place['availabilityStatus'], string> = {
  available: '판매중',
  soldout: '품절',
  low_stock: '재고부족',
  unknown: '미확인',
};

function makeIcon(color: string, selected: boolean) {
  const size = selected ? 18 : 12;
  const border = selected ? `3px solid white; box-shadow: 0 0 0 2px ${color}, 0 4px 12px rgba(0,0,0,0.3)` : '2px solid rgba(255,255,255,0.8); box-shadow: 0 2px 6px rgba(0,0,0,0.25)';
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:${color};
      border:${border};
      transition:all 0.15s;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

interface RealMapProps {
  places: Place[];
  selectedPlaceId?: string;
  onPlaceSelect: (placeId: string) => void;
}

export default function RealMap({ places, selectedPlaceId, onPlaceSelect }: RealMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Init map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [37.5, 127.0],
      zoom: 11,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync markers when places or selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove markers not in current places
    markersRef.current.forEach((marker, id) => {
      if (!places.find(p => p.id === id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    places.forEach(place => {
      const isSelected = place.id === selectedPlaceId;
      const color = STATUS_COLOR[place.availabilityStatus];
      const icon = makeIcon(color, isSelected);
      const existing = markersRef.current.get(place.id);

      if (existing) {
        existing.setIcon(icon);
      } else {
        const marker = L.marker([place.latitude, place.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:inherit;min-width:140px">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${place.name}</div>
              <div style="font-size:12px;color:#64748b;margin-bottom:6px">${place.address}</div>
              <span style="font-size:12px;font-weight:700;color:${color}">${STATUS_LABEL[place.availabilityStatus]}</span>
            </div>
          `, { closeButton: false, offset: [0, -4] });

        marker.on('click', () => onPlaceSelect(place.id));
        markersRef.current.set(place.id, marker);
      }
    });

    // Fit bounds if we have places
    if (places.length > 0) {
      const coords = places.map(p => [p.latitude, p.longitude] as L.LatLngTuple);
      map.fitBounds(L.latLngBounds(coords), { padding: [48, 48], maxZoom: 14 });
    }
  }, [places, selectedPlaceId, onPlaceSelect]);

  // Pan to selected marker and open popup
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPlaceId) return;
    const marker = markersRef.current.get(selectedPlaceId);
    if (marker) {
      map.panTo(marker.getLatLng(), { animate: true });
      marker.openPopup();
    }
  }, [selectedPlaceId]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 260 }}
      onClick={e => {
        // Deselect when clicking the map background (not a marker)
        if ((e.target as HTMLElement).closest('.leaflet-marker-icon') === null) {
          onPlaceSelect('');
        }
      }}
    />
  );
}
