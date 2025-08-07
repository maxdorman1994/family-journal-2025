import React, { useState, useRef, useCallback } from "react";
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
import { MapPin, Trash2, Edit, Calendar, ExternalLink } from "lucide-react";

interface MapPin {
  id: string;
  x: number; // X position on map (percentage)
  y: number; // Y position on map (percentage)
  lat?: number; // Optional real latitude
  lng?: number; // Optional real longitude
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

export default function Map() {
  const [pins, setPins] = useState<MapPin[]>([
    {
      id: "1",
      x: 25,
      y: 40,
      lat: 56.8198,
      lng: -5.1044,
      title: "Ben Nevis Base",
      description: "Started our epic climb to the highest peak in Scotland!",
      category: "adventure",
      date: "2024-06-15",
    },
    {
      id: "2",
      x: 60,
      y: 30,
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
    x: number;
    y: number;
  } | null>(null);

  const [newPin, setNewPin] = useState({
    title: "",
    description: "",
    category: "adventure" as MapPin["category"],
    date: "",
  });

  const mapRef = useRef<HTMLDivElement>(null);

  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setSelectedLocation({ x, y });
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
      x: selectedLocation.x,
      y: selectedLocation.y,
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
              <div className="relative">
                {/* Scotland Map Image */}
                <div
                  ref={mapRef}
                  className="relative h-[600px] w-full bg-gradient-to-br from-blue-100 via-green-50 to-blue-200 cursor-crosshair overflow-hidden"
                  onClick={handleMapClick}
                  style={{
                    backgroundImage: `
                      radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 20%),
                      radial-gradient(circle at 70% 30%, rgba(59, 130, 246, 0.1) 0%, transparent 25%),
                      radial-gradient(circle at 45% 60%, rgba(168, 85, 247, 0.1) 0%, transparent 30%),
                      radial-gradient(circle at 20% 80%, rgba(34, 197, 94, 0.1) 0%, transparent 20%)
                    `,
                  }}
                >
                  {/* Scotland Outline Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-transparent to-blue-100/30" />
                  
                  {/* Grid overlay for visual reference */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }} />

                  {/* Map Title */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                    <h3 className="font-bold text-emerald-700">Scotland</h3>
                    <p className="text-xs text-muted-foreground">Click to add pins</p>
                  </div>

                  {/* External Map Link */}
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://www.openstreetmap.org/#map=7/56.4907/-4.2026', '_blank');
                      }}
                      className="bg-white/90 backdrop-blur-sm hover:bg-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Full Map
                    </Button>
                  </div>

                  {/* Adventure Pins */}
                  {pins.map((pin) => (
                    <div
                      key={pin.id}
                      className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${pin.x}%`,
                        top: `${pin.y}%`,
                      }}
                    >
                      {/* Pin Icon */}
                      <div className={`w-6 h-6 rounded-full ${categoryColors[pin.category]} border-2 border-white shadow-lg flex items-center justify-center transform transition-transform group-hover:scale-125`}>
                        <MapPin className="w-3 h-3 text-white" />
                      </div>
                      
                      {/* Pin Tooltip */}
                      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 min-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${categoryColors[pin.category]} text-white text-xs`}>
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
                              className="h-6 w-6 p-0 pointer-events-auto"
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
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 pointer-events-auto"
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
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 shadow-lg" />
                      </div>
                    </div>
                  ))}
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
