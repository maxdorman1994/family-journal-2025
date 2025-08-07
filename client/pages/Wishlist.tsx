import { useState, useEffect } from "react";
import { Heart, MapPin, Star, Calendar, DollarSign, Users, Plus, X, Edit, Check, Clock, Camera, Mountain, Car, Plane, Train, Home, Utensils, AlertCircle, Sparkles, Target, TrendingUp, BookOpen, Search, Filter, Eye, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WishlistItem {
  id: string;
  title: string;
  location: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Planning' | 'Researching' | 'Ready' | 'Booked';
  estimatedCost: number;
  bestSeasons: string[];
  duration: string;
  category: 'Mountain' | 'Coast' | 'City' | 'Island' | 'Castle' | 'Nature' | 'Activity';
  familyVotes: number;
  notes: string;
  createdDate: string;
  targetDate?: string;
  researched: boolean;
}

export default function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'priority' | 'votes' | 'cost' | 'date'>('priority');

  const [newItem, setNewItem] = useState<Partial<WishlistItem>>({
    title: '',
    location: '',
    description: '',
    priority: 'Medium',
    status: 'Planning',
    estimatedCost: 500,
    bestSeasons: ['Summer'],
    duration: '3-4 days',
    category: 'Mountain',
    familyVotes: 0,
    notes: '',
    researched: false
  });

  // Load sample data
  useEffect(() => {
    loadSampleWishlist();
  }, []);

  const loadSampleWishlist = () => {
    const sampleItems: WishlistItem[] = [
      {
        id: '1',
        title: 'Isle of Skye Adventure',
        location: 'Isle of Skye, Scotland',
        description: 'Explore the dramatic landscapes, fairy pools, and ancient castles of Skye',
        priority: 'High',
        status: 'Researching',
        estimatedCost: 1200,
        bestSeasons: ['Spring', 'Summer', 'Autumn'],
        duration: '5-7 days',
        category: 'Island',
        familyVotes: 5,
        notes: 'Need to book accommodation early. Check ferry times. Visit Fairy Pools and Old Man of Storr.',
        createdDate: '2024-01-15',
        targetDate: '2024-07-15',
        researched: true
      },
      {
        id: '2', 
        title: 'Ben Nevis Summit Challenge',
        location: 'Lochaber, Scotland',
        description: 'Conquer Scotland\'s highest peak as a family adventure',
        priority: 'High',
        status: 'Planning',
        estimatedCost: 600,
        bestSeasons: ['Summer'],
        duration: '2-3 days',
        category: 'Mountain',
        familyVotes: 4,
        notes: 'Need proper hiking gear. Check weather conditions. Book accommodation in Fort William.',
        createdDate: '2024-01-20',
        researched: false
      },
      {
        id: '3',
        title: 'Edinburgh Festival Fringe',
        location: 'Edinburgh, Scotland',
        description: 'Experience the world\'s largest arts festival with family-friendly shows',
        priority: 'Medium',
        status: 'Ready',
        estimatedCost: 800,
        bestSeasons: ['Summer'],
        duration: '4-5 days',
        category: 'City',
        familyVotes: 3,
        notes: 'Book shows in advance. Consider Royal Mile walking tour. Visit Edinburgh Castle.',
        createdDate: '2024-02-01',
        targetDate: '2024-08-10',
        researched: true
      },
      {
        id: '4',
        title: 'Loch Ness & Highlands Tour',
        location: 'Scottish Highlands',
        description: 'Scenic drive through the Highlands with Loch Ness monster hunting',
        priority: 'Medium',
        status: 'Planning',
        estimatedCost: 900,
        bestSeasons: ['Spring', 'Summer', 'Autumn'],
        duration: '4-6 days',
        category: 'Nature',
        familyVotes: 4,
        notes: 'Rent a car. Book Loch Ness cruise. Visit Urquhart Castle. Stop at whisky distillery.',
        createdDate: '2024-02-10',
        researched: false
      },
      {
        id: '5',
        title: 'Orkney Islands Exploration',
        location: 'Orkney, Scotland',
        description: 'Discover ancient history, stunning coastlines, and unique wildlife',
        priority: 'Low',
        status: 'Researching',
        estimatedCost: 1000,
        bestSeasons: ['Summer'],
        duration: '6-8 days',
        category: 'Island',
        familyVotes: 2,
        notes: 'Ferry from mainland. Visit Skara Brae. Check puffin viewing seasons.',
        createdDate: '2024-02-15',
        researched: true
      }
    ];
    setWishlistItems(sampleItems);
  };

  const addWishlistItem = () => {
    if (!newItem.title || !newItem.location) return;

    const item: WishlistItem = {
      id: Date.now().toString(),
      title: newItem.title!,
      location: newItem.location!,
      description: newItem.description || '',
      priority: newItem.priority || 'Medium',
      status: newItem.status || 'Planning',
      estimatedCost: newItem.estimatedCost || 500,
      bestSeasons: newItem.bestSeasons || ['Summer'],
      duration: newItem.duration || '3-4 days',
      category: newItem.category || 'Mountain',
      familyVotes: 0,
      notes: newItem.notes || '',
      createdDate: new Date().toISOString().split('T')[0],
      researched: false
    };

    setWishlistItems(prev => [...prev, item]);
    setNewItem({
      title: '',
      location: '',
      description: '',
      priority: 'Medium',
      status: 'Planning',
      estimatedCost: 500,
      bestSeasons: ['Summer'],
      duration: '3-4 days',
      category: 'Mountain',
      familyVotes: 0,
      notes: '',
      researched: false
    });
    setShowAddForm(false);
  };

  const deleteItem = (id: string) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleResearched = (id: string) => {
    setWishlistItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, researched: !item.researched } : item
      )
    );
  };

  const addVote = (id: string) => {
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, familyVotes: item.familyVotes + 1 } : item
      )
    );
  };

  const removeVote = (id: string) => {
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, familyVotes: Math.max(0, item.familyVotes - 1) } : item
      )
    );
  };

  const updateStatus = (id: string, status: WishlistItem['status']) => {
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const filteredAndSortedItems = () => {
    let filtered = wishlistItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;

      return matchesSearch && matchesPriority && matchesCategory && matchesStatus;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'votes':
          return b.familyVotes - a.familyVotes;
        case 'cost':
          return a.estimatedCost - b.estimatedCost;
        case 'date':
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Researching': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'Booked': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mountain': return Mountain;
      case 'Coast': return MapPin;
      case 'City': return Home;
      case 'Island': return MapPin;
      case 'Castle': return Home;
      case 'Nature': return Mountain;
      case 'Activity': return Star;
      default: return MapPin;
    }
  };

  const totalBudget = wishlistItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const averageVotes = wishlistItems.length > 0 ? wishlistItems.reduce((sum, item) => sum + item.familyVotes, 0) / wishlistItems.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border-2 border-purple-200/50 shadow-lg">
            <Heart className="h-6 w-6 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Dream Adventures Await</span>
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
              Adventure Wishlist
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Dream destinations and future adventures we're planning to explore across Scotland and beyond
          </p>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{wishlistItems.length}</div>
                <div className="text-sm font-semibold text-slate-600">Adventures Planned</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-pink-600 mb-2">£{totalBudget.toLocaleString()}</div>
                <div className="text-sm font-semibold text-slate-600">Total Budget</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{Math.round(averageVotes * 10) / 10}</div>
                <div className="text-sm font-semibold text-slate-600">Avg Family Rating</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{wishlistItems.filter(i => i.status === 'Ready').length}</div>
                <div className="text-sm font-semibold text-slate-600">Ready to Book</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add New Adventure Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Dream Adventure
          </Button>
        </div>

        {/* Add Adventure Form */}
        {showAddForm && (
          <Card className="mb-8 border-0 shadow-xl bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-500" />
                  Add New Adventure
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Adventure Title *</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Isle of Skye Adventure"
                    className="border-2 border-slate-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
                  <Input
                    value={newItem.location}
                    onChange={(e) => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Scottish Highlands"
                    className="border-2 border-slate-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                  <Select value={newItem.priority} onValueChange={(value: any) => setNewItem(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="border-2 border-slate-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="High">High Priority</SelectItem>
                      <SelectItem value="Medium">Medium Priority</SelectItem>
                      <SelectItem value="Low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <Select value={newItem.category} onValueChange={(value: any) => setNewItem(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="border-2 border-slate-200 focus:border-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mountain">Mountain</SelectItem>
                      <SelectItem value="Coast">Coastal</SelectItem>
                      <SelectItem value="City">City</SelectItem>
                      <SelectItem value="Island">Island</SelectItem>
                      <SelectItem value="Castle">Castle</SelectItem>
                      <SelectItem value="Nature">Nature</SelectItem>
                      <SelectItem value="Activity">Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Estimated Cost (£)</label>
                  <Input
                    type="number"
                    value={newItem.estimatedCost}
                    onChange={(e) => setNewItem(prev => ({ ...prev, estimatedCost: parseInt(e.target.value) || 0 }))}
                    className="border-2 border-slate-200 focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration</label>
                  <Input
                    value={newItem.duration}
                    onChange={(e) => setNewItem(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g. 3-4 days"
                    className="border-2 border-slate-200 focus:border-purple-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this adventure..."
                  className="border-2 border-slate-200 focus:border-purple-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Notes & Research</label>
                <Textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Planning notes, research, links..."
                  className="border-2 border-slate-200 focus:border-purple-400"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={addWishlistItem}
                  disabled={!newItem.title || !newItem.location}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Add to Wishlist
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 border-2 border-slate-200"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">🔍 Search</label>
                <Input
                  placeholder="Search adventures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 border-slate-200 focus:border-purple-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="border-2 border-slate-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="border-2 border-slate-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Mountain">Mountain</SelectItem>
                    <SelectItem value="Coast">Coast</SelectItem>
                    <SelectItem value="City">City</SelectItem>
                    <SelectItem value="Island">Island</SelectItem>
                    <SelectItem value="Castle">Castle</SelectItem>
                    <SelectItem value="Nature">Nature</SelectItem>
                    <SelectItem value="Activity">Activity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="border-2 border-slate-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Researching">Researching</SelectItem>
                    <SelectItem value="Ready">Ready</SelectItem>
                    <SelectItem value="Booked">Booked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="border-2 border-slate-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="votes">Family Votes</SelectItem>
                    <SelectItem value="cost">Cost</SelectItem>
                    <SelectItem value="date">Date Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Grid */}
        {filteredAndSortedItems().length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-slate-100 to-purple-100 rounded-3xl p-12 border-2 border-slate-200 max-w-md mx-auto">
              <Heart className="h-16 w-16 mx-auto mb-6 text-slate-400" />
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No Adventures Found</h3>
              <p className="text-slate-600 mb-6">
                {wishlistItems.length === 0 
                  ? "Start planning your dream Scottish adventures!" 
                  : "Try adjusting your search filters."
                }
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                Add First Adventure
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedItems().map((item) => {
              const CategoryIcon = getCategoryIcon(item.category);
              return (
                <Card
                  key={item.id}
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/95 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <CategoryIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-800 group-hover:text-purple-600 transition-colors">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="h-3 w-3" />
                            {item.location}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`text-xs border-2 ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                      <Badge className={`text-xs border-2 ${getStatusColor(item.status)}`}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-semibold">£{item.estimatedCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    {/* Family Votes */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-700">Family Rating:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < item.familyVotes 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-slate-600 ml-1">({item.familyVotes})</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addVote(item.id)}
                        className="flex-1 text-xs"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Vote
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleResearched(item.id)}
                        className={`flex-1 text-xs ${item.researched ? 'bg-green-50 text-green-700' : ''}`}
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        {item.researched ? 'Researched' : 'Research'}
                      </Button>
                      <Select value={item.status} onValueChange={(value: any) => updateStatus(item.id, value)}>
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="Researching">Researching</SelectItem>
                          <SelectItem value="Ready">Ready</SelectItem>
                          <SelectItem value="Booked">Booked</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Notes Preview */}
                    {item.notes && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs text-slate-500 line-clamp-2">{item.notes}</p>
                      </div>
                    )}

                    {/* Target Date */}
                    {item.targetDate && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                        <Calendar className="h-3 w-3" />
                        Target: {new Date(item.targetDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
