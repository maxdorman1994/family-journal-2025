import { useState } from "react";
import { Search, Filter, Plus, BookOpen, MapPin, Heart, Calendar, Route, Car, Dog, Edit, Trash2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NewEntryForm from "@/components/NewEntryForm";

export default function Journal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [hoveredEntry, setHoveredEntry] = useState<number | null>(null);
  const [isNewEntryFormOpen, setIsNewEntryFormOpen] = useState(false);
  const [entries, setEntries] = useState(journalEntriesData);

  const journalEntries = [
    {
      id: 1,
      title: "Ben Nevis Summit - Our Greatest Challenge Yet!",
      date: "Sunday 3 August 2025",
      location: "Fort William, Highland",
      weather: "☀️ Sunny",
      mood: "🙏 Grateful",
      milesTraveled: 87,
      parking: "Free",
      dogFriendly: true,
      content: "What an incredible day! After months of training, we finally conquered Ben Nevis. The views from the summit were absolutely breathtaking - you could see for miles across the Scottish Highlands. Little Alex was such a trooper, and Bonnie loved every minute of it...",
      photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      tags: ["Mountain", "Challenge", "Family", "Views", "Achievement"]
    },
    {
      id: 2,
      title: "Magical Loch Lomond Picnic",
      date: "Sunday 28 July 2025",
      location: "Balloch, West Dunbartonshire",
      weather: "⛅ Partly Cloudy",
      mood: "😌 Peaceful",
      milesTraveled: 45,
      parking: "£5",
      dogFriendly: true,
      content: "A perfect family day by the beautiful Loch Lomond. We found the most amazing spot for our picnic with stunning views across the water. The kids (and Bonnie) had so much fun skipping stones and exploring the shoreline...",
      photos: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
      tags: ["Lake", "Family", "Relaxing", "Nature", "Picnic"]
    },
    {
      id: 3,
      title: "Edinburgh Castle - Step Back in Time",
      date: "Saturday 15 July 2025",
      location: "Edinburgh, Midlothian",
      weather: "🌧️ Light Rain",
      mood: "🤩 Amazed",
      milesTraveled: 123,
      parking: "£12",
      dogFriendly: false,
      content: "Despite the Scottish drizzle, Edinburgh Castle was absolutely magical. The history here is incredible - you can really feel the centuries of stories within these ancient walls. The views over Edinburgh from the castle are spectacular...",
      photos: ["/placeholder.svg", "/placeholder.svg"],
      tags: ["History", "Culture", "City", "Castle", "Education"]
    }
  ];

  const stats = [
    {
      icon: BookOpen,
      count: 6,
      label: "Journal Entries",
      gradient: "from-vibrant-blue to-scotland-loch"
    },
    {
      icon: MapPin,
      count: 6,
      label: "Places Visited",
      gradient: "from-scotland-forest to-vibrant-teal"
    },
    {
      icon: Heart,
      count: 19,
      label: "Memory Tags",
      gradient: "from-vibrant-pink to-scotland-heather"
    }
  ];

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || selectedTag === "all" || entry.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(journalEntries.flatMap(entry => entry.tags)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="bg-gradient-to-r from-vibrant-blue via-scotland-loch to-vibrant-teal bg-clip-text text-transparent">
            Our Scottish Journey
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Capturing memories, one adventure at a time
        </p>
        <Button size="lg" className="bg-gradient-to-r from-vibrant-blue to-scotland-loch hover:from-vibrant-blue/90 hover:to-scotland-loch/90">
          <Plus className="mr-2 h-5 w-5" />
          New Entry
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-scotland-thistle/20">
              <CardContent className="p-6">
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-2">{stat.count}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-scotland-thistle/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-4 w-4" />
              📅 Newest First
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSearchTerm(""); setSelectedTag("all"); }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Journal Entries Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-vibrant-blue via-scotland-thistle to-vibrant-pink"></div>

        <div className="space-y-8">
          {filteredEntries.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute left-6 w-4 h-4 bg-gradient-to-r from-vibrant-blue to-scotland-loch rounded-full border-4 border-white shadow-lg"></div>

              {/* Entry Card */}
              <div className="ml-20">
                <Card 
                  className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white/90 backdrop-blur-sm border-scotland-thistle/20 cursor-pointer"
                  onMouseEnter={() => setHoveredEntry(entry.id)}
                  onMouseLeave={() => setHoveredEntry(null)}
                >
                  <CardContent className="p-6">
                    {/* Entry Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{entry.title}</h3>
                        <p className="text-lg text-muted-foreground mb-1">{entry.date}</p>
                        <p className="text-vibrant-blue font-medium flex items-center">
                          <MapPin className="mr-1 h-4 w-4" />
                          {entry.location}
                        </p>
                      </div>
                      
                      {/* Action Buttons (appear on hover) */}
                      {hoveredEntry === entry.id && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Weather and Mood */}
                    <div className="flex gap-4 mb-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {entry.weather}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                        {entry.mood}
                      </span>
                    </div>

                    {/* Travel Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-scotland-mist/30 rounded-lg">
                      <div className="flex items-center text-sm text-gray-600">
                        <Route className="mr-2 h-4 w-4 text-vibrant-blue" />
                        <span className="font-medium">{entry.milesTraveled} miles traveled</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Car className="mr-2 h-4 w-4 text-scotland-forest" />
                        <span className="font-medium">Parking: {entry.parking}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Dog className="mr-2 h-4 w-4 text-vibrant-pink" />
                        <span className="font-medium">
                          {entry.dogFriendly ? "🐕 Dog friendly" : "❌ No dogs"}
                        </span>
                      </div>
                    </div>

                    {/* Photos Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {entry.photos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                          <img
                            src={photo}
                            alt={`Photo ${photoIndex + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {entry.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-scotland-thistle/20 text-scotland-thistle text-sm rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Content Preview */}
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {entry.content}
                    </p>

                    {/* View More Link */}
                    <div className="text-center pt-4 border-t border-scotland-thistle/20">
                      <p className="text-sm text-muted-foreground">
                        Click anywhere to view full story & photos
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No entries found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
}
