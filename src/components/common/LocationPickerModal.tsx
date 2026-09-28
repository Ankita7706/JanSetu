import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LoaderCircle, LocateFixed, MapPin, Search, X } from 'lucide-react';
import MapView, { type MapPosition } from '../map/MapView';
import type { RequestLocation } from '../../types';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: RequestLocation) => void;
  initialLocation?: string;
  initialCoordinates?: MapPosition;
}

interface GeocodingResult {
  lat: string;
  lon: string;
  display_name: string;
}

let nominatimQueue = Promise.resolve();
let lastNominatimRequestAt = 0;

async function requestNominatim(url: string, signal: AbortSignal): Promise<Response> {
  const queuedRequest = nominatimQueue.then(async () => {
    const delay = Math.max(0, 1100 - (Date.now() - lastNominatimRequestAt));
    if (delay) await new Promise(resolve => window.setTimeout(resolve, delay));
    if (signal.aborted) throw new DOMException('Request aborted', 'AbortError');
    lastNominatimRequestAt = Date.now();
    return fetch(url, { signal, headers: { Accept: 'application/json' } });
  });
  nominatimQueue = queuedRequest.then(() => undefined, () => undefined);
  return queuedRequest;
}

function isValidPosition(position: MapPosition): boolean {
  return Number.isFinite(position.latitude) && Number.isFinite(position.longitude) &&
    position.latitude >= -90 && position.latitude <= 90 &&
    position.longitude >= -180 && position.longitude <= 180;
}

export default function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation = '',
  initialCoordinates,
}: LocationPickerModalProps) {
  const [position, setPosition] = useState<MapPosition | undefined>(() => initialCoordinates);
  const [center, setCenter] = useState<[number, number]>(() => initialCoordinates
    ? [initialCoordinates.latitude, initialCoordinates.longitude]
    : [20.2961, 85.8245]);
  const [address, setAddress] = useState(() => initialLocation);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [error, setError] = useState('');
  const reverseAbort = useRef<AbortController | null>(null);

  useEffect(() => () => reverseAbort.current?.abort(), []);

  if (!isOpen) return null;

  const reverseGeocode = async (nextPosition: MapPosition) => {
    reverseAbort.current?.abort();
    const controller = new AbortController();
    reverseAbort.current = controller;
    setReverseGeocoding(true);
    setError('');
    try {
      const params = new URLSearchParams({
        format: 'jsonv2',
        lat: String(nextPosition.latitude),
        lon: String(nextPosition.longitude),
        zoom: '18',
        addressdetails: '1',
      });
      const contactEmail = import.meta.env.VITE_NOMINATIM_EMAIL?.trim();
      if (contactEmail) params.set('email', contactEmail);
      const response = await requestNominatim(
        `https://nominatim.openstreetmap.org/reverse?${params}`,
        controller.signal,
      );
      if (!response.ok) throw new Error('Address lookup is temporarily unavailable.');
      const result = await response.json() as { display_name?: string };
      if (!controller.signal.aborted) setAddress(result.display_name || 'Address unavailable for this location');
    } catch (lookupError) {
      if (!controller.signal.aborted) {
        setAddress('Address unavailable for this location');
        setError(lookupError instanceof Error ? lookupError.message : 'Could not look up this address.');
      }
    } finally {
      if (!controller.signal.aborted) setReverseGeocoding(false);
    }
  };

  const selectPosition = (nextPosition: MapPosition, knownAddress?: string, recenter = false) => {
    if (!isValidPosition(nextPosition)) {
      setError('The selected coordinates are not valid. Please choose another point.');
      return;
    }
    setPosition(nextPosition);
    if (recenter) setCenter([nextPosition.latitude, nextPosition.longitude]);
    if (knownAddress) {
      reverseAbort.current?.abort();
      setReverseGeocoding(false);
      setAddress(knownAddress);
      setError('');
    } else {
      setAddress('');
      void reverseGeocode(nextPosition);
    }
  };

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    setSearching(true);
    setError('');
    const controller = new AbortController();
    try {
      const params = new URLSearchParams({ format: 'jsonv2', limit: '1', q: query });
      const contactEmail = import.meta.env.VITE_NOMINATIM_EMAIL?.trim();
      if (contactEmail) params.set('email', contactEmail);
      const response = await requestNominatim(
        `https://nominatim.openstreetmap.org/search?${params}`,
        controller.signal,
      );
      if (!response.ok) throw new Error('Location search is temporarily unavailable.');
      const results = await response.json() as GeocodingResult[];
      const match = results[0];
      if (!match) {
        setError('No matching location found. Try a nearby place or a more specific address.');
        return;
      }
      selectPosition({ latitude: Number(match.lat), longitude: Number(match.lon) }, match.display_name, true);
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : 'Could not search for this location.');
    } finally {
      setSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    setError('');
    if (!navigator.geolocation) {
      setError('This browser does not support location services.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      result => {
        setLocating(false);
        selectPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude }, undefined, true);
      },
      geolocationError => {
        setLocating(false);
        const messages: Record<number, string> = {
          1: 'Location permission was denied. Allow location access in your browser and try again.',
          2: 'Your current location could not be determined. Try again or search for an address.',
          3: 'Finding your location timed out. Try again when you have a clearer GPS signal.',
        };
        setError(messages[geolocationError.code] || 'Could not get your current location.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  const handleConfirm = () => {
    if (!position || !isValidPosition(position)) {
      setError('Select a point on the map before continuing.');
      return;
    }
    onSelectLocation({
      ...position,
      address: address.trim() || 'Address unavailable for this location',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-5">
      <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border-2 border-black bg-white shadow-brutal-xl" onClick={event => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b-2 border-black bg-brand-yellow p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-black text-brand-yellow"><MapPin size={18} /></div>
            <div>
              <h3 className="font-heading text-lg font-extrabold leading-tight">SELECT PROBLEM LOCATION</h3>
              <p className="text-xs font-bold text-black/60">Search, click the map, or move the pin</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close location picker" className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-black hover:text-white"><X size={17} /></button>
        </div>

        <div className="space-y-3 overflow-y-auto p-4 md:p-5">
          <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="location-search" className="sr-only">Search address or place</label>
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input id="location-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search address, landmark, or place" className="w-full rounded-xl border-2 border-black bg-gray-50 py-2.5 pl-9 pr-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black" />
            </div>
            <button type="submit" disabled={searching || !search.trim()} className="btn-brutal-secondary rounded-xl px-4 py-2 text-xs font-extrabold disabled:opacity-50">{searching ? <LoaderCircle size={15} className="animate-spin" /> : 'Search location'}</button>
            <button type="button" onClick={handleCurrentLocation} disabled={locating} className="btn-brutal-primary inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold disabled:opacity-50">
              {locating ? <LoaderCircle size={15} className="animate-spin" /> : <LocateFixed size={15} />}
              <span>{locating ? 'Finding...' : 'Use My Current Location'}</span>
            </button>
          </form>

          <div className="overflow-hidden rounded-xl border-2 border-black">
            <MapView center={center} className="h-64 w-full sm:h-80" selectedPosition={position} onMapClick={nextPosition => selectPosition(nextPosition)} onPositionChange={nextPosition => selectPosition(nextPosition)} />
          </div>

          <div className="rounded-xl border-2 border-black bg-gray-50 p-3.5">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase"><MapPin size={15} className="text-red-600" />Selected Location{reverseGeocoding && <LoaderCircle size={13} className="animate-spin" aria-label="Looking up address" />}</div>
            {position ? (
              <div className="mt-2 space-y-1 text-xs">
                <p className="font-semibold leading-relaxed">Address: {address || 'Looking up address...'}</p>
                <p className="font-mono text-black/60">Latitude: {position.latitude.toFixed(6)} | Longitude: {position.longitude.toFixed(6)}</p>
              </div>
            ) : <p className="mt-1 text-xs font-medium text-black/60">Choose a point on the map to place your pin.</p>}
          </div>
          {error && <p role="alert" className="rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-xs font-bold text-red-800">{error}</p>}
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-black bg-gray-50 p-4">
          <p className="hidden text-[11px] font-bold text-black/60 sm:block">Map tiles &amp; address search by OpenStreetMap</p>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onClose} className="btn-brutal-secondary rounded-xl px-4 py-2 text-xs font-bold">Cancel</button>
            <button type="button" onClick={handleConfirm} disabled={!position} className="btn-brutal-primary rounded-xl px-5 py-2 text-xs font-extrabold disabled:opacity-50">Confirm Location</button>
          </div>
        </div>
      </div>
    </div>
  );
}
