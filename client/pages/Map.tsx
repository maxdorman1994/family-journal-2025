import React, { useState, useCallback, useRef } from "react";
import ReactMapGL, { Marker, Popup, ViewState } from "react-map-gl";
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
import { MapPin, Trash2, Edit, Calendar, ExternalLink, Info } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

interface MapPin {
  id: string;
  latitude: number;
  longitude: number;
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

// Mapbox public token - you can use this demo token or replace with your own
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

export default function MapPage() {
  const [pins, setPins] = useState<MapPin[]>([
    {
      id: "1",
      latitude: 56.8198,
      longitude: -5.1044,
      title: "Ben Nevis Base",
      description: "Started our epic climb to the highest peak in Scotland!",
      category: "adventure",
      date: "2024-06-15",
    },
    {
      id: "2",
      latitude: 57.1474,
      longitude: -2.0942,
      title: "Cairngorms Photography",
      description: "Amazing sunset shots with the whole family.",
      category: "photo",
      date: "2024-07-02",
    },
    {
      id: "3",
      latitude: 55.9533,
      longitude: -3.1883,
      title: "Edinburgh Castle",
      description: "Explored the historic castle with amazing city views.",
      category: "memory",
      date: "2024-05-20",
    },
  ]);

  const [viewState, setViewState] = useState<ViewState>({
    longitude: -4.2026,
    latitude: 56.4907,
    zoom: 6.5,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

  const [newPin, setNewPin] = useState({
    title: "",
    description: "",
    category: "adventure" as MapPin["category"],
    date: "",
  });

  const mapRef = useRef<any>();

  const handleMapClick = useCallback((event: any) => {
    const { lng, lat } = event.lngLat;
    
    setSelectedLocation({ latitude: lat, longitude: lng });
    setSelectedPin(null);
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
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
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
    setSelectedPin(null);
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
    setSelectedPin(null);
  };

  const flyToLocation = (latitude: number, longitude: number) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: 12,
      duration: 2000
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">
          <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Our Adventure Map
          </span>
        </h1>
        <p className="text-center text-muted-foreground mb-6">
          Click anywhere on the map to add a new pin for your Scottish adventures!
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

        {/* Info Banner */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2 text-sm text-blue-700">
            <Info className="w-4 h-4" />
            <span>Interactive map powered by Mapbox - Click to add pins, drag to explore Scotland!</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[600px] w-full relative">
                <ReactMapGL
                  ref={mapRef}
                  {...viewState}
                  onMove={evt => setViewState(evt.viewState)}
                  onClick={handleMapClick}
                  mapStyle="mapbox://styles/mapbox/outdoors-v12"
                  mapboxAccessToken={MAPBOX_TOKEN}
                  doubleClickZoom={true}
                  scrollZoom={true}
                  dragPan={true}
                  dragRotate={false}
                  touchZoom={true}
                  touchRotate={false}
                  keyboard={true}
                  attributionControl={true}
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Adventure Pins */}
                  {pins.map((pin) => (
                    <Marker
                      key={pin.id}
                      latitude={pin.latitude}
                      longitude={pin.longitude}
                      anchor="bottom"
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setSelectedPin(pin);
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full ${categoryColors[pin.category]} border-3 border-white shadow-lg flex items-center justify-center cursor-pointer transform transition-transform hover:scale-110`}>
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </Marker>
                  ))}

                  {/* Pin Popup */}
                  {selectedPin && (
                    <Popup
                      latitude={selectedPin.latitude}
                      longitude={selectedPin.longitude}
                      anchor="top"
                      onClose={() => setSelectedPin(null)}
                      closeButton={true}
                      closeOnClick={false}
                    >
                      <div className="p-3 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${categoryColors[selectedPin.category]} text-white text-xs`}>
                            {categoryLabels[selectedPin.category]}
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditPin(selectedPin)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePin(selectedPin.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{selectedPin.title}</h3>
                        {selectedPin.description && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {selectedPin.description}
                          </p>
                        )}
                        {selectedPin.date && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(selectedPin.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </Popup>
                  )}
                </ReactMapGL>

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewState({
                        ...viewState,
                        longitude: -4.2026,
                        latitude: 56.4907,
                        zoom: 6.5,
                        bearing: 0,
                        pitch: 0
                      });
                    }}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  >
                    Reset View
                  </Button>
                </div>
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
                    className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => flyToLocation(pin.latitude, pin.longitude)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPin(pin);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePin(pin.id);
                          }}
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
                    <div className="text-xs text-muted-foreground mt-1">
                      Click to view on map
                    </div>
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
            {selectedLocation && !editingPin && (
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <strong>Location:</strong> {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
              </div>
            )}

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
