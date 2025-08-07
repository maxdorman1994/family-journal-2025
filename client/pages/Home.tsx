import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import {
  ArrowRight,
  Camera,
  MapPin,
  Heart,
  Calendar,
  Users,
  Edit,
  Upload,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { processPhoto, uploadPhotoToCloudflare, validatePhotoFile } from "@/lib/photoUtils";

export default function Home() {
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [memberPhotos, setMemberPhotos] = useState<Record<number, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoEdit = (memberIndex: number) => {
    setEditingMember(memberIndex);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || editingMember === null) return;

    // Validate file
    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      alert(`Invalid file: ${validation.error}`);
      return;
    }

    setIsUploading(true);
    try {
      // Process the photo
      const processedPhoto = await processPhoto(file);

      // For demo purposes, we'll use the preview URL directly
      // In production, you'd want to upload to Cloudflare and save the URL
      setMemberPhotos(prev => ({
        ...prev,
        [editingMember]: processedPhoto.preview
      }));

      setEditingMember(null);
      console.log(`Profile photo updated for family member ${editingMember}`);
    } catch (error) {
      console.error('Error processing photo:', error);
      alert('Failed to process photo. Please try again.');
    } finally {
      setIsUploading(false);
    }

    // Reset file input
    event.target.value = '';
  };

  const removePhoto = (memberIndex: number) => {
    const photoUrl = memberPhotos[memberIndex];
    if (photoUrl && photoUrl.startsWith('blob:')) {
      URL.revokeObjectURL(photoUrl);
    }
    setMemberPhotos(prev => {
      const updated = { ...prev };
      delete updated[memberIndex];
      return updated;
    });
  };
  const familyMembers = [
    {
      name: "Max Dorman",
      role: "DAD",
      avatar: "/placeholder.svg",
      bio: "Adventure enthusiast and family trip organizer. Loves planning routes, discovering hidden gems, and capturing the perfect Highland sunset photos.",
      colors: {
        bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
        border: "border-blue-200/60",
        accent: "from-blue-500 to-indigo-500"
      }
    },
    {
      name: "Charlotte Foster",
      role: "MUM",
      avatar: "/placeholder.svg",
      bio: "Nature lover and family historian. Documents our adventures and ensures everyone stays safe while exploring Scotland's wild landscapes.",
      colors: {
        bg: "bg-gradient-to-br from-rose-50 to-pink-100",
        border: "border-rose-200/60",
        accent: "from-rose-500 to-pink-500"
      }
    },
    {
      name: "Oscar",
      role: "SON",
      avatar: "/placeholder.svg",
      bio: "Young explorer with boundless energy. Always the first to spot wildlife and loves climbing rocks and splashing in Highland streams.",
      colors: {
        bg: "bg-gradient-to-br from-green-50 to-emerald-100",
        border: "border-green-200/60",
        accent: "from-green-500 to-emerald-500"
      }
    },
    {
      name: "Rose",
      role: "DAUGHTER",
      avatar: "/placeholder.svg",
      bio: "Curious adventurer who collects interesting stones and leaves. Has an amazing memory for the stories behind each place we visit.",
      colors: {
        bg: "bg-gradient-to-br from-purple-50 to-violet-100",
        border: "border-purple-200/60",
        accent: "from-purple-500 to-violet-500"
      }
    },
    {
      name: "Lola",
      role: "DAUGHTER",
      avatar: "/placeholder.svg",
      bio: "Our youngest adventurer with the biggest smile. Brings joy to every journey and reminds us to appreciate the simple moments.",
      colors: {
        bg: "bg-gradient-to-br from-amber-50 to-yellow-100",
        border: "border-amber-200/60",
        accent: "from-amber-500 to-yellow-500"
      }
    },
  ];

  const recentAdventures = [
    {
      title: "Ben Nevis Summit",
      date: "3 August 2025",
      location: "Fort William",
      image: "/placeholder.svg",
      tags: ["Mountain", "Challenge", "Views"],
    },
    {
      title: "Loch Lomond Picnic",
      date: "28 July 2025",
      location: "Balloch",
      image: "/placeholder.svg",
      tags: ["Lake", "Family", "Relaxing"],
    },
    {
      title: "Edinburgh Castle Visit",
      date: "15 July 2025",
      location: "Edinburgh",
      image: "/placeholder.svg",
      tags: ["History", "Culture", "City"],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-vibrant-blue via-scotland-loch to-vibrant-teal bg-clip-text text-transparent">
            Welcome to Our
          </span>
          <br />
          <span className="bg-gradient-to-r from-scotland-thistle via-vibrant-pink to-scotland-heather bg-clip-text text-transparent">
            Scottish Adventure
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Follow our family as we explore the breathtaking landscapes, rich
          history, and hidden gems of Scotland. Every adventure is a memory
          waiting to be made.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-vibrant-blue to-scotland-loch hover:from-vibrant-blue/90 hover:to-scotland-loch/90"
          >
            <Link to="/journal">
              <Calendar className="mr-2 h-5 w-5" />
              View Our Journey
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/gallery">
              <Camera className="mr-2 h-5 w-5" />
              Photo Gallery
            </Link>
          </Button>
        </div>
      </div>

      {/* Family Members */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">
          <span className="bg-gradient-to-r from-vibrant-blue to-scotland-loch bg-clip-text text-transparent">
            Meet the Adventure Crew
          </span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {familyMembers.map((member, index) => (
            <Card
              key={index}
              className={`text-center hover:shadow-lg transition-all duration-300 hover:scale-105 ${member.colors.bg} backdrop-blur-sm border-2 ${member.colors.border}`}
            >
              <CardContent className="p-6">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-3 bg-gradient-to-r ${member.colors.accent} p-0.5 shadow-lg`}>
                  <div className="w-full h-full rounded-full overflow-hidden bg-white">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground font-medium mb-3">{member.role}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Hidden file input for photo editing */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Edit instructions */}
        {Object.keys(memberPhotos).length === 0 && (
          <div className="text-center mt-4">
            <p className="text-sm text-slate-500">
              💡 Hover over any family member's photo and click the edit button to upload a custom picture!
            </p>
          </div>
        )}
      </section>

      {/* Adventure Stats */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center bg-gradient-to-br from-vibrant-blue/10 to-scotland-loch/10 border-vibrant-blue/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-vibrant-blue to-scotland-loch flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-vibrant-blue mb-2">6</div>
              <div className="text-sm text-muted-foreground">
                Journal Entries
              </div>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-br from-scotland-forest/10 to-vibrant-teal/10 border-scotland-forest/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-scotland-forest to-vibrant-teal flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-scotland-forest mb-2">
                6
              </div>
              <div className="text-sm text-muted-foreground">
                Places Visited
              </div>
            </CardContent>
          </Card>

          <Card className="text-center bg-gradient-to-br from-vibrant-pink/10 to-scotland-heather/10 border-vibrant-pink/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-vibrant-pink to-scotland-heather flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-vibrant-pink mb-2">
                19
              </div>
              <div className="text-sm text-muted-foreground">Memory Tags</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Adventures */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-vibrant-blue to-scotland-loch bg-clip-text text-transparent">
              Recent Adventures
            </span>
          </h2>
          <Button asChild variant="outline">
            <Link to="/journal">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentAdventures.map((adventure, index) => (
            <Card
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-105 bg-white/80 backdrop-blur-sm border-scotland-thistle/20"
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={adventure.image}
                    alt={adventure.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-semibold text-lg">{adventure.title}</h3>
                    <p className="text-sm opacity-90">{adventure.location}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {adventure.date}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {adventure.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-scotland-thistle/20 text-scotland-thistle text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-vibrant-blue/10 via-scotland-thistle/10 to-vibrant-pink/10 rounded-2xl p-8 border border-scotland-thistle/20">
        <Users className="w-16 h-16 mx-auto mb-4 text-vibrant-blue" />
        <h2 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-to-r from-vibrant-blue to-scotland-loch bg-clip-text text-transparent">
            Start Your Own Adventure
          </span>
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Inspired to explore Scotland? Check out our hints and tips, browse our
          wishlist for future adventures, or see which Munros we're planning to
          bag next!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="outline">
            <Link to="/hints-tips">Hints & Tips</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/wishlist">Our Wishlist</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/munro-bagging">Munro Bagging</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
