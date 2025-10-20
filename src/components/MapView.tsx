import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import diyaIcon from '@/assets/diya.svg';
import { supabase } from '@/integrations/supabase/client';

interface Lamp {
  id: string;
  coords: { lat: number; lng: number };
  message: string;
  created_at: string;
}

interface Edge {
  id: string;
  parent_lamp_id: string;
  child_lamp_id: string;
}

interface MapViewProps {
  onMapReady: (map: L.Map) => void;
  showLines: boolean;
}

export default function MapView({ onMapReady, showLines }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.MarkerClusterGroup | null>(null);
  const linesLayer = useRef<L.LayerGroup | null>(null);
  const [lamps, setLamps] = useState<Lamp[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = L.map(mapContainer.current, {
      center: [20, 78],
      zoom: 3,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '',
      maxZoom: 19,
    }).addTo(map.current);

    // Initialize marker cluster group
    markersLayer.current = L.markerClusterGroup({
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/80 text-primary-foreground font-bold text-sm glow-amber">${count}</div>`,
          className: 'custom-cluster-icon',
          iconSize: L.point(48, 48),
        });
      },
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
    });
    map.current.addLayer(markersLayer.current);

    // Initialize lines layer
    linesLayer.current = L.layerGroup();
    map.current.addLayer(linesLayer.current);

    onMapReady(map.current);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMapReady]);

  // Fetch lamps and edges
  useEffect(() => {
    const fetchData = async () => {
      const { data: lampsData } = await supabase
        .from('lamps')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: edgesData } = await supabase
        .from('edges')
        .select('*');

      if (lampsData) {
        setLamps(lampsData.map(lamp => ({
          ...lamp,
          coords: lamp.coords as { lat: number; lng: number }
        })));
      }
      if (edgesData) setEdges(edgesData);
    };

    fetchData();

    // Real-time subscriptions
    const lampsChannel = supabase
      .channel('lamps-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lamps',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    const edgesChannel = supabase
      .channel('edges-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'edges',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(lampsChannel);
      supabase.removeChannel(edgesChannel);
    };
  }, []);

  // Render markers
  useEffect(() => {
    if (!markersLayer.current) return;

    markersLayer.current.clearLayers();

    const customIcon = L.icon({
      iconUrl: diyaIcon,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      className: 'animate-pulse-glow',
    });

    lamps.forEach((lamp) => {
      const marker = L.marker([lamp.coords.lat, lamp.coords.lng], {
        icon: customIcon,
      });

      const date = new Date(lamp.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      marker.bindPopup(`
        <div class="p-3 min-w-[200px]">
          <p class="text-sm text-foreground mb-2">${lamp.message}</p>
          <p class="text-xs text-muted-foreground">${date}</p>
        </div>
      `);

      markersLayer.current?.addLayer(marker);
    });
  }, [lamps]);

  // Render connection lines
  useEffect(() => {
    if (!linesLayer.current) return;

    linesLayer.current.clearLayers();

    if (!showLines) return;

    edges.forEach((edge) => {
      const parentLamp = lamps.find((l) => l.id === edge.parent_lamp_id);
      const childLamp = lamps.find((l) => l.id === edge.child_lamp_id);

      if (parentLamp && childLamp) {
        const line = L.polyline(
          [
            [parentLamp.coords.lat, parentLamp.coords.lng],
            [childLamp.coords.lat, childLamp.coords.lng],
          ],
          {
            color: '#FDB933',
            weight: 2,
            opacity: 0.6,
            className: 'connection-line',
          }
        );
        linesLayer.current?.addLayer(line);
      }
    });
  }, [edges, lamps, showLines]);

  return (
    <>
      <div ref={mapContainer} className="absolute inset-0 z-0" />
      <style>{`
        .leaflet-popup-content-wrapper {
          background: hsl(var(--card));
          color: hsl(var(--card-foreground));
          border-radius: var(--radius);
        }
        .leaflet-popup-tip {
          background: hsl(var(--card));
        }
        .connection-line {
          filter: drop-shadow(0 0 4px hsla(45, 100%, 65%, 0.6));
        }
      `}</style>
    </>
  );
}
