import { useState, useEffect } from "react";
import { Mountain, Trophy, MapPin, Clock, Star, TrendingUp, Camera, CheckCircle, Circle, Target, Compass, Flag, Crown, Award, Zap, Calendar, Database, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getAllMunrosWithCompletion,
  completeMunro,
  uncompleteMunro,
  getMunroCompletionStats,
  getMunroRegions,
  testMunroConnection,
  MunroWithCompletion
} from "@/lib/munroService";
import { COMPLETE_MUNROS_LIST } from "@/data/complete-munros";

export default function MunroBagging() {
  const [munros, setMunros] = useState<MunroWithCompletion[]>([]);
  const [filter, setFilter] = useState<'all' | 'completed' | 'remaining'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [regions, setRegions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    completed_count: 0,
    total_munros: 282,
    completion_percentage: 0,
    highest_completed: 0
  });

  // Load Munros data from Supabase
  useEffect(() => {
    loadMunrosData();
    loadRegions();
  }, []);

  const loadMunrosData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔄 Loading Munros from Supabase...');
      const munrosData = await getAllMunrosWithCompletion();
      setMunros(munrosData);

      // Load statistics (with fallback)
      try {
        const statsData = await getMunroCompletionStats();
        setStats(statsData);
      } catch (statsError) {
        console.warn('Could not load stats, using defaults:', statsError);
        setStats({
          completed_count: munrosData.filter(m => m.completed).length,
          total_munros: 282,
          completion_percentage: Math.round((munrosData.filter(m => m.completed).length / 282) * 100),
          highest_completed: munrosData.filter(m => m.completed).reduce((max, m) => Math.max(max, m.height), 0)
        });
      }

      console.log(`✅ Loaded ${munrosData.length} Munros successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('Failed to load from Supabase, using fallback data:', errorMessage);

      // Set appropriate error message
      if (errorMessage.includes('not configured')) {
        setError('📝 Development Mode: Supabase not configured - using local data');
      } else if (errorMessage.includes('SCHEMA_MISSING') || errorMessage.includes('Could not find the table') || errorMessage.includes('relation "munros" does not exist')) {
        setError('🏔️ Database Setup Required: Please run the Munro Bagging SQL schema - using local data');
      } else {
        setError(`⚠️ Database Error: Using local data (${errorMessage.substring(0, 50)}...)`);
      }

      // Fallback to local data
      console.log('📦 Loading fallback Munro data...');
      const fallbackMunros: MunroWithCompletion[] = COMPLETE_MUNROS_LIST.slice(0, 50).map(munro => ({
        ...munro,
        completed: munro.id === '1', // Mark Ben Nevis as completed for demo
        completion: munro.id === '1' ? {
          id: 'demo-1',
          munro_id: '1',
          completed_date: '2025-08-03',
          notes: 'Amazing summit views! Our greatest family achievement so far.',
          photo_count: 4,
          weather_conditions: 'Sunny and clear',
          climbing_time: '7 hours 30 minutes'
        } : undefined
      }));

      setMunros(fallbackMunros);
      setStats({
        completed_count: 1,
        total_munros: 282,
        completion_percentage: 0.4,
        highest_completed: 1345
      });

      console.log(`📦 Loaded ${fallbackMunros.length} fallback Munros`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      const regionsData = await getMunroRegions();
      setRegions(regionsData);
      console.log(`✅ Loaded ${regionsData.length} regions from database`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn('Failed to load regions from database, using fallback:', errorMessage);

      // Only log error if it's not the expected schema missing error
      if (!errorMessage.includes('SCHEMA_MISSING') && !errorMessage.includes('not configured')) {
        console.error('Error fetching Munros:', error);
      }

      // Fallback regions based on the sample data
      const fallbackRegions = [
        'Cairngorms', 'Lochaber', 'Western Highlands', 'Southern Highlands',
        'Glen Coe', 'Skye', 'Torridon', 'Sutherland', 'Arran', 'Mull',
        'Mamores', 'Glen Affric', 'Glen Shiel', 'Knoydart', 'Loch Lomond', 'Loch Earn'
      ];
      setRegions(fallbackRegions);
      console.log(`📦 Using ${fallbackRegions.length} fallback regions`);
    }
  };

  const completedCount = stats.completed_count;
  const totalMunros = stats.total_munros;
  const completionPercentage = stats.completion_percentage;

  const filteredMunros = munros.filter(munro => {
    const matchesFilter = filter === 'all' ||
                         (filter === 'completed' && munro.completed) ||
                         (filter === 'remaining' && !munro.completed);
    const matchesRegion = regionFilter === 'all' || munro.region === regionFilter;
    const matchesDifficulty = difficultyFilter === 'all' || munro.difficulty === difficultyFilter;
    const matchesSearch = munro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         munro.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         munro.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesRegion && matchesDifficulty && matchesSearch;
  });

  const toggleMunroComplete = async (munroId: string) => {
    const munro = munros.find(m => m.id === munroId);
    if (!munro) return;

    try {
      if (error && error.includes('Database Setup Required')) {
        // If database isn't set up, use local state only
        console.log('📦 Using local state for Munro completion (database not available)');
        setMunros(prev => prev.map(m =>
          m.id === munroId
            ? {
                ...m,
                completed: !m.completed,
                completion: !m.completed ? {
                  id: `local-${munroId}`,
                  munro_id: munroId,
                  completed_date: new Date().toISOString().split('T')[0],
                  notes: `Completed ${m.name} - what an adventure!`,
                  photo_count: Math.floor(Math.random() * 5) + 1,
                  weather_conditions: 'Perfect climbing conditions',
                  climbing_time: m.estimated_time
                } : undefined
              }
            : m
        ));

        // Update stats
        const newCompletedCount = munros.filter(m => m.id === munroId ? !m.completed : m.completed).length;
        setStats(prev => ({
          ...prev,
          completed_count: newCompletedCount,
          completion_percentage: Math.round((newCompletedCount / prev.total_munros) * 100)
        }));

        return;
      }

      // Try database operations
      if (munro.completed) {
        // Uncomplete the Munro
        await uncompleteMunro(munroId);
        console.log(`✅ Munro ${munro.name} marked as not completed`);
      } else {
        // Complete the Munro
        await completeMunro({
          munro_id: munroId,
          completed_date: new Date().toISOString().split('T')[0],
          notes: `Completed ${munro.name} - what an adventure!`,
          photo_count: Math.floor(Math.random() * 5) + 1,
          weather_conditions: 'Perfect climbing conditions',
          climbing_time: munro.estimated_time
        });
        console.log(`✅ Munro ${munro.name} marked as completed`);
      }

      // Reload data to get updated state
      await loadMunrosData();

    } catch (dbError) {
      console.error('Database error, falling back to local state:', dbError);

      // Fallback to local state if database fails
      setMunros(prev => prev.map(m =>
        m.id === munroId
          ? {
              ...m,
              completed: !m.completed,
              completion: !m.completed ? {
                id: `local-${munroId}`,
                munro_id: munroId,
                completed_date: new Date().toISOString().split('T')[0],
                notes: `Completed ${m.name} - what an adventure!`,
                photo_count: Math.floor(Math.random() * 5) + 1,
                weather_conditions: 'Perfect climbing conditions',
                climbing_time: m.estimated_time
              } : undefined
            }
          : m
      ));

      setError('📱 Using local tracking (database unavailable)');
    }
  };

  const handleAddCustomMunro = async () => {
    if (!addMunroForm.name.trim() || !addMunroForm.region.trim()) {
      setError('Please fill in at least the name and region fields');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🆕 Adding custom Munro:', addMunroForm.name);

      const newMunro = await addCustomMunro(addMunroForm);
      console.log('✅ Custom Munro added successfully:', newMunro);

      // Reset form and hide modal
      setAddMunroForm({
        name: '',
        height: 914,
        region: '',
        difficulty: 'Moderate',
        latitude: 56.0,
        longitude: -4.0,
        description: '',
        estimated_time: '4-6 hours',
        best_seasons: ['May', 'June', 'July', 'August', 'September'],
        os_grid_ref: ''
      });
      setShowAddMunro(false);

      // Reload data to show the new Munro
      await loadMunrosData();
      await loadRegions();

      setError('✅ Custom Munro added successfully! Progress updated.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Failed to add custom Munro:', errorMessage);
      setError(`❌ Failed to add custom Munro: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const result = await testMunroConnection();
      setError(result.success ? `✅ ${result.message}` : `❌ ${result.message}: ${result.error}`);
    } catch (error) {
      setError(`❌ Connection test failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Extreme': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const achievements = [
    { name: "First Peak", description: "Complete your first Munro", unlocked: completedCount >= 1, icon: Flag },
    { name: "High Achiever", description: "Climb Scotland's highest peak", unlocked: munros.find(m => m.name === "Ben Nevis")?.completed || false, icon: Crown },
    { name: "Double Digits", description: "Complete 10 Munros", unlocked: completedCount >= 10, icon: Award },
    { name: "Quarter Century", description: "Complete 25 Munros", unlocked: completedCount >= 25, icon: Star },
    { name: "Half Century", description: "Complete 50 Munros", unlocked: completedCount >= 50, icon: Trophy },
    { name: "Munro Completer", description: "Complete all 282 Munros", unlocked: completedCount >= totalMunros, icon: Zap }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse">
            <Database className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading All 282 Munros</h3>
          <p className="text-slate-600">Preparing your Scottish mountain adventure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-6xl opacity-5 animate-bounce">⛰️</div>
        <div className="absolute top-40 right-20 text-4xl opacity-10 animate-pulse">🏔️</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-5 animate-bounce" style={{animationDelay: '1s'}}>🗻</div>
        <div className="absolute top-60 left-1/3 text-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}>⛷️</div>
        <div className="absolute bottom-40 right-10 text-4xl opacity-5 animate-bounce" style={{animationDelay: '1.5s'}}>🧗</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Hero Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-green-400/20 to-purple-400/20 rounded-full blur-3xl transform -rotate-6"></div>
          <div className="relative">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border-2 border-green-200/50 shadow-lg">
              <Mountain className="h-6 w-6 text-green-600 animate-pulse" />
              <span className="text-sm font-medium text-green-700">Munro Bagging Adventure</span>
              <Mountain className="h-6 w-6 text-green-600 animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 relative">
              <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
                Munro Bagging
              </span>
              <div className="absolute -top-4 -right-4 text-2xl animate-spin">⛰️</div>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Conquering Scotland's 282 magnificent peaks over 3,000 feet
              <span className="inline-block ml-2 text-2xl animate-bounce">🏔️</span>
            </p>

            {/* Error Display */}
            {error && (
              <div className="mb-8 max-w-3xl mx-auto">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 text-amber-800 shadow-lg">
                  <div className="flex items-center justify-center mb-3">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <span className="font-semibold">System Status</span>
                  </div>
                  <p className="text-sm text-center leading-relaxed mb-4">{error}</p>

                  {error.includes('Database Setup Required') && (
                    <div className="bg-white/50 rounded-xl p-4 mb-4 text-xs">
                      <div className="font-semibold mb-2">📋 Setup Instructions:</div>
                      <ol className="list-decimal list-inside space-y-1 text-amber-700">
                        <li>Go to your Supabase Dashboard → SQL Editor</li>
                        <li>Create a new query and copy the Munro Bagging SQL schema</li>
                        <li>Run the schema to create munros and completion tables</li>
                        <li>Refresh this page to enable cross-device sync</li>
                      </ol>
                    </div>
                  )}

                  <div className="text-xs text-center text-amber-600 mb-4">
                    📱 Your progress is being tracked locally until database is connected
                  </div>

                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testConnection}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Test Connection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMunrosData}
                      className="border-amber-300 text-amber-700 hover:bg-amber-100"
                    >
                      Retry Load
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Progress Overview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border-2 border-green-200/50 shadow-xl max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-800">Your Progress</h3>
                <div className="text-3xl font-bold text-green-600">{completedCount}/{totalMunros}</div>
              </div>
              <Progress value={completionPercentage} className="h-4 mb-4" />
              <div className="flex justify-between text-sm text-slate-600">
                <span>{completionPercentage.toFixed(1)}% Complete</span>
                <span>{totalMunros - completedCount} remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6 relative">
              <div className="absolute inset-0 opacity-5 text-6xl flex items-center justify-center font-bold">⛰️</div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2 text-center">{completedCount}</div>
                <div className="text-sm font-semibold text-slate-600 text-center">Munros Completed</div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6 relative">
              <div className="absolute inset-0 opacity-5 text-6xl flex items-center justify-center font-bold">🏔️</div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2 text-center">{stats.highest_completed}m</div>
                <div className="text-sm font-semibold text-slate-600 text-center">Highest Conquered</div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6 relative">
              <div className="absolute inset-0 opacity-5 text-6xl flex items-center justify-center font-bold">🏆</div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2 text-center">{achievements.filter(a => a.unlocked).length}</div>
                <div className="text-sm font-semibold text-slate-600 text-center">Achievements Unlocked</div>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-6 relative">
              <div className="absolute inset-0 opacity-5 text-6xl flex items-center justify-center font-bold">📅</div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-5 group-hover:opacity-10 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <div className="text-4xl font-bold text-slate-800 mb-2 text-center">{Math.ceil((totalMunros - completedCount) / 12)}</div>
                <div className="text-sm font-semibold text-slate-600 text-center">Years to Complete</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Trophy className="h-6 w-6 text-amber-500" />
              Achievements
              <Badge variant="secondary">{achievements.filter(a => a.unlocked).length}/{achievements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 shadow-lg'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-amber-400 to-yellow-500'
                          : 'bg-gray-300'
                      }`}>
                        <Icon className={`h-5 w-5 ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">{achievement.name}</h4>
                        <p className="text-sm text-slate-600">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">🔍 Search</label>
                <Input
                  placeholder="Search Munros..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-2 border-slate-200 focus:border-green-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">📊 Status</label>
                <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                  <SelectTrigger className="border-2 border-slate-200 focus:border-green-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Munros</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="remaining">Remaining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">🗺️ Region</label>
                <Select value={regionFilter} onValueChange={setRegionFilter}>
                  <SelectTrigger className="border-2 border-slate-200 focus:border-green-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map(region => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">⚡ Difficulty</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="border-2 border-slate-200 focus:border-green-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                    <SelectItem value="Extreme">Extreme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                    setRegionFilter('all');
                    setDifficultyFilter('all');
                  }}
                  className="w-full border-2 border-slate-200 hover:bg-slate-50"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Munros Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMunros.map((munro) => (
            <Card
              key={munro.id}
              className={`group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer ${
                munro.completed
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                  : 'bg-white/95 backdrop-blur-sm'
              }`}
              onClick={() => toggleMunroComplete(munro.id)}
            >
              <CardContent className="p-6">
                {/* Status Icon */}
                <div className="absolute top-4 right-4">
                  {munro.completed ? (
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center group-hover:border-green-400 transition-colors">
                      <Circle className="h-5 w-5 text-slate-400 group-hover:text-green-400" />
                    </div>
                  )}
                </div>

                {/* Mountain Icon */}
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Mountain className="h-8 w-8 text-white" />
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-green-600 transition-colors">
                    {munro.name}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-blue-600">{munro.height}m</span>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      {munro.region}
                    </Badge>
                    <Badge className={`text-xs border-2 ${getDifficultyColor(munro.difficulty)}`}>
                      {munro.difficulty}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {munro.description}
                  </p>

                  <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {munro.estimatedTime}
                    </div>
                    {munro.completion?.photo_count && munro.completion.photo_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        {munro.completion.photo_count} photos
                      </div>
                    )}
                  </div>

                  {munro.completed && munro.completion?.completed_date && (
                    <div className="text-xs text-green-600 font-medium">
                      ✅ Completed {new Date(munro.completion.completed_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredMunros.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-slate-100 to-blue-100 rounded-3xl p-12 border-2 border-slate-200 max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">No Munros Found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your search filters</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setRegionFilter('all');
                  setDifficultyFilter('all');
                }}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                Show All Munros
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
