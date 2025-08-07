import { Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
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
import {
  getFamilyMembers,
  updateFamilyMemberAvatar,
  removeFamilyMemberAvatar,
  uploadFamilyMemberAvatar,
  subscribeToFamilyMembers,
  testFamilyMembersConnection,
  FamilyMember
} from "@/lib/familyMembersService";

export default function Home() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'local'>('connecting');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load family members data and setup real-time sync
  useEffect(() => {
    loadFamilyMembersData();

    // Setup real-time subscription
    const unsubscribe = subscribeToFamilyMembers((members) => {
      console.log('🔄 Real-time sync update received:', members.length, 'members');
      setFamilyMembers(members);
      setSyncStatus('connected');
    });

    return unsubscribe;
  }, []);

  const loadFamilyMembersData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading family members from Supabase...');
      const members = await getFamilyMembers();

      setFamilyMembers(members);
      setSyncStatus('connected');
      // Temporarily force an error to show test button
      setError('🔍 Debug Mode: Database connected but forcing test button visibility');
      console.log(`✅ Loaded ${members.length} family members successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('Failed to load from Supabase, using fallback:', errorMessage);

      // Set sync status and appropriate error message
      setSyncStatus('local');
      if (errorMessage.includes('not configured')) {
        setError('📝 Development Mode: Supabase not configured - using local data');
      } else if (errorMessage.includes('SCHEMA_MISSING') || errorMessage.includes('Could not find the table')) {
        setError('🎯 Database Setup Required: Please run family-members-schema.sql in Supabase SQL Editor - using local data');
      } else {
        setSyncStatus('disconnected');
        setError(`⚠️ Database Error: Using local data (${errorMessage.substring(0, 50)}...)`);
      }

      // Fallback to hardcoded data
      setFamilyMembers([
        {
          id: '1',
          name: "Max Dorman",
          role: "DAD",
          bio: "Adventure enthusiast and family trip organizer. Loves planning routes, discovering hidden gems, and capturing the perfect Highland sunset photos.",
          position_index: 0,
          display_avatar: "/placeholder.svg",
          colors: {
            bg: "bg-gradient-to-br from-blue-50 to-indigo-100",
            border: "border-blue-200/60",
            accent: "from-blue-500 to-indigo-500"
          }
        },
        {
          id: '2',
          name: "Charlotte Foster",
          role: "MUM",
          bio: "Nature lover and family historian. Documents our adventures and ensures everyone stays safe while exploring Scotland's wild landscapes.",
          position_index: 1,
          display_avatar: "/placeholder.svg",
          colors: {
            bg: "bg-gradient-to-br from-rose-50 to-pink-100",
            border: "border-rose-200/60",
            accent: "from-rose-500 to-pink-500"
          }
        },
        {
          id: '3',
          name: "Oscar",
          role: "SON",
          bio: "Young explorer with boundless energy. Always the first to spot wildlife and loves climbing rocks and splashing in Highland streams.",
          position_index: 2,
          display_avatar: "/placeholder.svg",
          colors: {
            bg: "bg-gradient-to-br from-green-50 to-emerald-100",
            border: "border-green-200/60",
            accent: "from-green-500 to-emerald-500"
          }
        },
        {
          id: '4',
          name: "Rose",
          role: "DAUGHTER",
          bio: "Curious adventurer who collects interesting stones and leaves. Has an amazing memory for the stories behind each place we visit.",
          position_index: 3,
          display_avatar: "/placeholder.svg",
          colors: {
            bg: "bg-gradient-to-br from-purple-50 to-violet-100",
            border: "border-purple-200/60",
            accent: "from-purple-500 to-violet-500"
          }
        },
        {
          id: '5',
          name: "Lola",
          role: "DAUGHTER",
          bio: "Our youngest adventurer with the biggest smile. Brings joy to every journey and reminds us to appreciate the simple moments.",
          position_index: 4,
          display_avatar: "/placeholder.svg",
          colors: {
            bg: "bg-gradient-to-br from-amber-50 to-yellow-100",
            border: "border-amber-200/60",
            accent: "from-amber-500 to-yellow-500"
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoEdit = (memberId: string) => {
    setEditingMember(memberId);
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
      console.log(`📸 Processing and uploading photo for member: ${editingMember}`);

      // Process the photo
      const processedPhoto = await processPhoto(file);

      if (error && error.includes('Database Setup Required')) {
        // If database isn't set up, use local state only
        console.log('📦 Using local state for avatar (database not available)');
        setFamilyMembers(prev =>
          prev.map(member =>
            member.id === editingMember
              ? { ...member, display_avatar: processedPhoto.preview, has_custom_avatar: true }
              : member
          )
        );
      } else {
        // Upload to Cloudflare and update database
        await uploadFamilyMemberAvatar(editingMember, processedPhoto, (progress) => {
          console.log(`Upload progress: ${progress}%`);
        });

        // Reload data to get updated state
        await loadFamilyMembersData();
      }

      setEditingMember(null);
      console.log(`✅ Profile photo updated successfully`);
    } catch (dbError) {
      console.error('Error uploading avatar:', dbError);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }

    // Reset file input
    event.target.value = '';
  };

  const removePhoto = async (memberId: string) => {
    try {
      if (error && error.includes('Database Setup Required')) {
        // Local only
        setFamilyMembers(prev =>
          prev.map(member =>
            member.id === memberId
              ? { ...member, display_avatar: '/placeholder.svg', has_custom_avatar: false, avatar_url: undefined }
              : member
          )
        );
      } else {
        await removeFamilyMemberAvatar(memberId);
        await loadFamilyMembersData();
      }
    } catch (dbError) {
      console.error('Database error, using local state:', dbError);
      setFamilyMembers(prev =>
        prev.map(member =>
          member.id === memberId
            ? { ...member, display_avatar: '/placeholder.svg', has_custom_avatar: false }
            : member
        )
      );
    }
  };

  const testConnection = async () => {
    try {
      setSyncStatus('connecting');
      setError('🔍 Testing database connection and checking tables...');

      // Import the debug function
      const { debugAvailableTables } = await import('@/lib/familyMembersService');

      // First check what tables are available
      console.log('🔍 Debugging available tables...');
      const availableTables = await debugAvailableTables();
      console.log('📋 Found tables:', availableTables);

      const result = await testFamilyMembersConnection();

      if (result.success) {
        setSyncStatus('connected');
        setError(`✅ ${result.message}`);

        // Reload data after successful connection
        await loadFamilyMembersData();
      } else {
        setSyncStatus('disconnected');
        let debugInfo = '';
        if (availableTables.length > 0) {
          debugInfo = ` (Found tables: ${availableTables.join(', ')})`;
        } else {
          debugInfo = ` (No accessible tables found)`;
        }
        setError(`❌ ${result.message}${result.error ? ': ' + result.error : ''}${debugInfo}`);
      }
    } catch (error) {
      setSyncStatus('disconnected');
      setError(`❌ Connection test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Family Crew</h3>
          <p className="text-slate-600">Getting your adventure team ready...</p>
        </div>
      </div>
    );
  }

  const hardcodedMembers = [
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
          {familyMembers.map((member) => (
            <Card
              key={member.id}
              className={`text-center hover:shadow-lg transition-all duration-300 hover:scale-105 ${member.colors.bg} backdrop-blur-sm border-2 ${member.colors.border}`}
            >
              <CardContent className="p-6">
                <div className="relative group w-20 h-20 mx-auto mb-4">
                  <div className={`w-full h-full rounded-full overflow-hidden border-3 bg-gradient-to-r ${member.colors.accent} p-0.5 shadow-lg`}>
                    <div className="w-full h-full rounded-full overflow-hidden bg-white">
                      <img
                        src={member.display_avatar || member.avatar_url || '/placeholder.svg'}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Edit overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 w-7 p-0 bg-white/90 hover:bg-white"
                        onClick={() => handlePhotoEdit(member.id)}
                        disabled={isUploading}
                      >
                        {isUploading && editingMember === member.id ? (
                          <Upload className="h-3 w-3 animate-pulse" />
                        ) : (
                          <Edit className="h-3 w-3" />
                        )}
                      </Button>
                      {member.has_custom_avatar && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 w-7 p-0"
                          onClick={() => removePhoto(member.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
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

        {/* Sync Status & Instructions */}
        <div className="mt-6 space-y-4">
          {/* Sync Status Indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              syncStatus === 'connected' ? 'bg-green-500' :
              syncStatus === 'connecting' ? 'bg-yellow-500' :
              syncStatus === 'local' ? 'bg-blue-500' : 'bg-red-500'
            }`} />
            <span className="text-xs font-medium text-slate-600">
              {syncStatus === 'connected' ? '🌐 Profile photos sync across devices' :
               syncStatus === 'connecting' ? '🔄 Connecting...' :
               syncStatus === 'local' ? '📱 Local mode only' : '❌ Sync disconnected'}
            </span>
          </div>

          {/* Error Display */}
          {error && (
            <div className={`max-w-md mx-auto border-2 rounded-xl p-3 text-center ${
              error.startsWith('✅') ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' :
              'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800'
            }`}>
              <p className="text-xs leading-relaxed mb-2">{error}</p>

              {error.includes('Database Setup Required') && (
                <div className="bg-white/50 rounded-lg p-2 mb-2 text-xs">
                  <div className="font-semibold mb-1">📋 Setup Instructions:</div>
                  <ol className="list-decimal list-inside space-y-1 text-amber-700 text-xs">
                    <li>Go to Supabase Dashboard → SQL Editor</li>
                    <li>Paste contents of family-members-schema.sql</li>
                    <li>Run the schema to create tables</li>
                    <li>Click "Test" button below to verify</li>
                  </ol>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={testConnection}
                  disabled={syncStatus === 'connecting'}
                  className="text-xs px-2 py-1"
                >
                  {syncStatus === 'connecting' ? (
                    <>
                      <Upload className="h-3 w-3 mr-1 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Test Connection
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Edit instructions */}
          {!error || error.startsWith('✅') ? (
            <div className="text-center">
              <p className="text-sm text-slate-500">
                💡 Hover over any family member's photo and click the edit button to upload a custom picture!
              </p>
            </div>
          ) : null}
        </div>
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
