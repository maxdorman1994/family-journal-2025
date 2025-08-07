import React, { useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Trash2, Edit, Calendar, Camera } from "lucide-react";
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

const categoryColors = {
  adventure: "bg-emerald-500",
  photo: "bg-blue-500",
  memory: "bg-purple-500",
  wishlist: "bg-orange-500",
};

const categoryLabels = {
  adventure: "Adventure",
  photo: "Photo Spot",
  memory: "Memory",
  wishlist: "Wishlist",
};

// Component to handle map clicks
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (latlng: L.LatLng) => void;
}) {
  useMapEvents({
    click: (event) => {
      onMapClick(event.latlng);
    },
  });
  return null;
}

export default function Map() {
  const [pins, setPins] = useState<MapPin[]>([
    {
      id: "1",
      lat: 56.8198,
      lng: -5.1044,
      title: "Ben Nevis Base",
      description: "Started our epic climb to the highest peak in Scotland!",
      category: "adventure",
      date: "2024-06-15",
    },
    {
      id: "2",
      lat: 57.1474,
      lng: -2.0942,
      title: "Cairngorms Photography",
      description: "Amazing sunset shots with the whole family.",
      category: "photo",
      date: "2024-07-02",
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [newPin, setNewPin] = useState({
    title: "",
    description: "",
    category: "adventure" as MapPin["category"],
    date: "",
  });

  const mapRef = useRef<L.Map>(null);

  const handleMapClick = useCallback((latlng: L.LatLng) => {
    setSelectedLocation({ lat: latlng.lat, lng: latlng.lng });
    setEditingPin(null);
    setNewPin({
      title: "",
      description: "",
      category: "adventure",
      date: new Date().toISOString().split("T")[0],
    });
    setIsDialogOpen(true);
  }, []);

  const handleAddPin = () => {
    if (!selectedLocation || !newPin.title.trim()) return;

    const pin: MapPin = {
      id: Date.now().toString(),
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      title: newPin.title,
      description: newPin.description,
      category: newPin.category,
      date: newPin.date,
    };

    setPins([...pins, pin]);
    setIsDialogOpen(false);
    setSelectedLocation(null);
  };

  const handleEditPin = (pin: MapPin) => {
    setEditingPin(pin);
    setNewPin({
      title: pin.title,
      description: pin.description,
      category: pin.category,
      date: pin.date || "",
    });
    setIsDialogOpen(true);
  };

  const handleUpdatePin = () => {
    if (!editingPin || !newPin.title.trim()) return;

    setPins(
      pins.map((pin) =>
        pin.id === editingPin.id ? { ...pin, ...newPin } : pin,
      ),
    );
    setIsDialogOpen(false);
    setEditingPin(null);
  };

  const handleDeletePin = (pinId: string) => {
    setPins(pins.filter((pin) => pin.id !== pinId));
  };

  // Scotland bounds - centered on Scotland with good zoom
  const scotlandCenter: [number, number] = [56.4907, -4.2026];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Adventure Map
          </span>
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Click anywhere on the map to add a new pin for your Scottish
          adventures!
        </p>

        {/* Category Legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Badge
              key={key}
              className={`${categoryColors[key as keyof typeof categoryColors]} text-white`}
            >
              <MapPin className="w-3 h-3 mr-1" />
              {label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                <MapContainer
                  center={scotlandCenter}
                  zoom={7}
                  style={{ height: "100%", width: "100%" }}
                  ref={mapRef}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <MapClickHandler onMapClick={handleMapClick} />

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
                                onClick={() => handleEditPin(pin)}
                                className="h-6 w-6 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePin(pin.id)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-semibold text-sm mb-1">
                            {pin.title}
                          </h3>
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
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pin List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Adventure Pins ({pins.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {pins.map((pin) => (
                  <div
                    key={pin.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge
                        className={`${categoryColors[pin.category]} text-white text-xs`}
                      >
                        {categoryLabels[pin.category]}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditPin(pin)}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeletePin(pin.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{pin.title}</h4>
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
                ))}
                {pins.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No pins yet!</p>
                    <p className="text-xs">
                      Click on the map to add your first adventure pin.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Pin Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPin ? "Edit Pin" : "Add New Pin"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={newPin.title}
                onChange={(e) =>
                  setNewPin({ ...newPin, title: e.target.value })
                }
                placeholder="Enter pin title..."
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newPin.description}
                onChange={(e) =>
                  setNewPin({ ...newPin, description: e.target.value })
                }
                placeholder="Describe this location..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={newPin.category}
                onChange={(e) =>
                  setNewPin({
                    ...newPin,
                    category: e.target.value as MapPin["category"],
                  })
                }
                className="mt-1 w-full p-2 border border-border rounded-md bg-background"
              >
                <option value="adventure">Adventure</option>
                <option value="photo">Photo Spot</option>
                <option value="memory">Memory</option>
                <option value="wishlist">Wishlist</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={newPin.date}
                onChange={(e) => setNewPin({ ...newPin, date: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={editingPin ? handleUpdatePin : handleAddPin}>
                {editingPin ? "Update Pin" : "Add Pin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
