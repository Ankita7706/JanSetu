import { useEffect, type ReactNode } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';

export interface MapPosition {
  latitude: number;
  longitude: number;
}

export interface MapViewMarker extends MapPosition {
  id: string;
  label: string;
  popup?: ReactNode;
}

interface MapViewProps {
  center: [number, number];
  className: string;
  markers?: MapViewMarker[];
  selectedPosition?: MapPosition;
  onMapClick?: (position: MapPosition) => void;
  onPositionChange?: (position: MapPosition) => void;
  fitMarkers?: boolean;
}

const osmAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function makePinIcon(selected = false) {
  return L.divIcon({
    className: 'jansetu-map-marker',
    html: `<span class="jansetu-map-pin${selected ? ' jansetu-map-pin-selected' : ''}"><span></span></span>`,
    iconSize: [30, 38],
    iconAnchor: [15, 37],
    popupAnchor: [0, -34],
  });
}

function MapInteraction({
  onMapClick,
}: {
  onMapClick?: (position: MapPosition) => void;
}) {
  useMapEvents({
    click(event) {
      onMapClick?.({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

function MapViewport({ center, markers, fitMarkers }: {
  center: [number, number];
  markers: MapViewMarker[];
  fitMarkers: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!fitMarkers) map.setView(center, map.getZoom());
  }, [center, fitMarkers, map]);

  useEffect(() => {
    if (!fitMarkers || markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map(marker => [marker.latitude, marker.longitude]));
    if (markers.length === 1) {
      map.setView(bounds.getCenter(), 14);
    } else {
      map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
    }
  }, [fitMarkers, map, markers]);

  return null;
}

export default function MapView({
  center,
  className,
  markers = [],
  selectedPosition,
  onMapClick,
  onPositionChange,
  fitMarkers = false,
}: MapViewProps) {
  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={selectedPosition ? 14 : 8}
        scrollWheelZoom
        className="h-full min-h-[260px] w-full"
      >
        <TileLayer
          attribution={osmAttribution}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapInteraction onMapClick={onMapClick} />
        <MapViewport center={center} markers={markers} fitMarkers={fitMarkers} />
        {selectedPosition && (
          <Marker
            position={[selectedPosition.latitude, selectedPosition.longitude]}
            icon={makePinIcon(true)}
            draggable={Boolean(onPositionChange)}
            eventHandlers={onPositionChange ? {
              dragend(event) {
                const point = event.target.getLatLng();
                onPositionChange({ latitude: point.lat, longitude: point.lng });
              },
            } : undefined}
          />
        )}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={makePinIcon()}
          >
            <Popup>
              {marker.popup || <strong>{marker.label}</strong>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}