// Add these imports to your existing Home.tsx file

import { 
  getAdventureStats,
  subscribeToAdventureStats,
  testAdventureStatsConnection,
  getFallbackAdventureStats,
  AdventureStat 
} from "@/lib/adventureStatsService";

// Add these state variables to your existing useState declarations:

const [adventureStats, setAdventureStats] = useState<AdventureStat[]>([]);
const [statsLoading, setStatsLoading] = useState(true);

// Add this function to load adventure statistics:

const loadAdventureStats = async () => {
  try {
    setStatsLoading(true);
    console.log('🔄 Loading adventure statistics from database...');
    
    const stats = await getAdventureStats();
    setAdventureStats(stats);
    console.log(`✅ Loaded ${stats.length} adventure statistics`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn('Failed to load adventure stats from database, using fallback:', errorMessage);
    
    // Convert fallback data to AdventureStat format
    const fallbackData = getFallbackAdventureStats();
    const fallbackStats: AdventureStat[] = Object.entries(fallbackData).map(([key, data], index) => ({
      stat_type: key,
      stat_value: data.value,
      stat_description: data.description,
      display_order: index + 1,
      is_primary_stat: ['journal_entries', 'places_explored', 'memory_tags', 'photos_captured'].includes(key)
    }));
    
    setAdventureStats(fallbackStats);
  } finally {
    setStatsLoading(false);
  }
};

// Add this to your existing useEffect (or create a new one):

useEffect(() => {
  loadAdventureStats();

  // Setup real-time subscription for adventure stats
  const unsubscribeStats = subscribeToAdventureStats((stats) => {
    console.log('🔄 Real-time adventure stats update received:', stats.length, 'stats');
    setAdventureStats(stats);
  });

  return () => {
    unsubscribeStats();
  };
}, []);

// Helper function to get stat by type:

const getStatValue = (statType: string): number => {
  const stat = adventureStats.find(s => s.stat_type === statType);
  return stat?.stat_value || 0;
};

const getStatDescription = (statType: string): string => {
  const stat = adventureStats.find(s => s.stat_type === statType);
  return stat?.stat_description || '';
};

// Replace your hardcoded stats in the JSX with these dynamic values:

{/* Journal Entries */}
<div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
  {getStatValue('journal_entries')}
</div>
<div className="text-lg font-semibold text-slate-800 mb-2">Journal Entries</div>
<div className="text-sm text-slate-500">{getStatDescription('journal_entries')}</div>

{/* Places Explored */}
<div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
  {getStatValue('places_explored')}
</div>
<div className="text-lg font-semibold text-slate-800 mb-2">Places Explored</div>
<div className="text-sm text-slate-500">{getStatDescription('places_explored')}</div>

{/* Memory Tags */}
<div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-3">
  {getStatValue('memory_tags')}
</div>
<div className="text-lg font-semibold text-slate-800 mb-2">Memory Tags</div>
<div className="text-sm text-slate-500">{getStatDescription('memory_tags')}</div>

{/* Photos Captured */}
<div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
  {getStatValue('photos_captured')}
</div>
<div className="text-lg font-semibold text-slate-800 mb-2">Photos Captured</div>
<div className="text-sm text-slate-500">{getStatDescription('photos_captured')}</div>

{/* And similarly for all expanded stats... */}

{/* Miles Traveled */}
<div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-3">
  {getStatValue('miles_traveled')}
</div>

{/* Munros Climbed */}
<div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-lime-600 bg-clip-text text-transparent mb-3">
  {getStatValue('munros_climbed')}
</div>

{/* Adventures This Year */}
<div className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-3">
  {getStatValue('adventures_this_year')}
</div>

{/* Wildlife Spotted */}
<div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-3">
  {getStatValue('wildlife_spotted')}
</div>

{/* Castles Explored */}
<div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-3">
  {getStatValue('castles_explored')}
</div>

{/* Weather Adventures */}
<div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">
  {getStatValue('weather_adventures')}
</div>