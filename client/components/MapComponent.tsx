import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Calendar } from "lucide-react";
import L from "leaflet";

// Fix for default markers in React Leaflet
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import markerRetina from "leaflet/dist/images/marker-icon-2x.png";

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  category: "adventure" | "photo" | "memory" | "wishlist";
  date?: string;
}

interface MapComponentProps {
  pins: MapPin[];
  onMapClick: (latlng: { lat: number; lng: number }) => void;
  onEditPin: (pin: MapPin) => void;
  onDeletePin: (pinId: string) => void;
  categoryColors: Record<string, string>;
  categoryLabels: Record<string, string>;
}

// Component to handle map clicks
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click: (event) => {
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  pins,
  onMapClick,
  onEditPin,
  onDeletePin,
  categoryColors,
  categoryLabels,
}) => {
  // Scotland bounds - centered on Scotland with good zoom
  const scotlandCenter: [number, number] = [56.4907, -4.2026];

  return (
    <MapContainer
      center={scotlandCenter}
      zoom={7}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapClickHandler onMapClick={onMapClick} />

      {pins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]}>
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <Badge
                  className={`${categoryColors[pin.category]} text-white text-xs`}
                >
                  {categoryLabels[pin.category]}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditPin(pin)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeletePin(pin.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <h3 className="font-semibold text-sm mb-1">{pin.title}</h3>
              {pin.description && (
                <p className="text-xs text-muted-foreground mb-2">
                  {pin.description}
                </p>
              )}
              {pin.date && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(pin.date).toLocaleDateString()}
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
