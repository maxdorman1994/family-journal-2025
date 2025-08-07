import { useState, useEffect } from "react";
import {
  Calendar,
  MapPin,
  Camera,
  Heart,
  Trophy,
  Star,
  Mountain,
  Users,
  Target,
  CheckCircle,
  Lock,
  Award,
  Zap,
  Map,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSync } from "@/lib/syncService";
import {
  calculateRealMilestones,
  getRealMilestoneStats,
  subscribeToRealMilestones,
  filterMilestonesByCategory,
  getNextMilestones,
  getRecentlyCompleted,
  MILESTONE_CATEGORIES,
  RealMilestone,
  MilestoneCategory,
  MilestoneStats,
} from "@/lib/realMilestonesService";

export default function Milestones() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<MilestoneCategory[]>([]);
  const [milestones, setMilestones] = useState<MilestoneWithProgress[]>([]);
  const [stats, setStats] = useState<MilestoneStats>({
    completed_count: 0,
    in_progress_count: 0,
    locked_count: 0,
    total_xp: 0,
    completion_percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  // Load milestone data
  useEffect(() => {
    const loadMilestoneData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log("🔄 Loading milestone data...");

        // Load all data in parallel
        const [categoriesData, milestonesData, statsData] = await Promise.all([
          getMilestoneCategories(),
          getMilestonesWithProgress("demo-user"),
          getMilestoneStats("demo-user"),
        ]);

        setCategories([
          { id: "all", name: "All", icon: "Star" },
          ...categoriesData,
        ]);
        setMilestones(milestonesData);
        setStats(statsData);

        console.log(
          `✅ Loaded milestone data: ${milestonesData.length} milestones, ${statsData.total_xp} XP`,
        );
      } catch (error) {
        console.error("Error loading milestone data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load milestone data",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadMilestoneData();

    // Set up real-time subscription
    const unsubscribe = subscribeToMilestoneUpdates(
      "demo-user",
      (updatedMilestones) => {
        setMilestones(updatedMilestones);
        // Recalculate stats
        getMilestoneStats("demo-user").then(setStats);
      },
    );

    return unsubscribe;
  }, []);

  // Split milestones by status
  const completedMilestones = milestones.filter(
    (m) => m.progress?.status === "completed",
  );
  const inProgressMilestones = milestones.filter(
    (m) => m.progress?.status === "in_progress",
  );
  const lockedMilestones = milestones.filter(
    (m) => !m.progress || m.progress.status === "locked",
  );

  // Helper function to get the correct icon component
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      MapPin,
      Camera,
      Heart,
      Trophy,
      Star,
      Mountain,
      Users,
      Target,
      CheckCircle,
      Lock,
      Award,
      Zap,
      Map,
      Eye,
      Calendar,
    };
    return iconMap[iconName] || MapPin;
  };

  const filterMilestones = (
    milestones: MilestoneWithProgress[],
    category: string,
  ) => {
    if (category === "all") return milestones;
    return milestones.filter((m) => m.category_id === category);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vibrant-blue mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-muted-foreground">
            Loading Milestones...
          </h2>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-500 mb-4">❌ Error loading milestones</div>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
            Adventure Milestones
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Track your progress, celebrate achievements, and unlock new adventures
          as you explore Scotland!
        </p>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-200/60">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-1">
                {stats.completed_count}
              </h3>
              <p className="text-sm text-emerald-600">Completed Milestones</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200/60">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-amber-800 mb-1">
                {stats.total_xp}
              </h3>
              <p className="text-sm text-amber-600">Total XP Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200/60">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-1">
                {Math.round(stats.completion_percentage)}%
              </h3>
              <p className="text-sm text-blue-600">Progress Complete</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map((category) => {
          const Icon = getIconComponent(category.icon);
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-vibrant-blue to-scotland-loch text-white"
                  : "hover:bg-scotland-thistle/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Completed Milestones */}
      {filterMilestones(completedMilestones, selectedCategory).length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              🏆 Completed Achievements
            </span>
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filterMilestones(completedMilestones, selectedCategory).length})
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterMilestones(completedMilestones, selectedCategory)
              .slice(0, showAllCompleted ? undefined : 3)
              .map((milestone) => {
                const Icon = getIconComponent(milestone.icon);
                const colorScheme = milestone.color_scheme;
                return (
                  <Card
                    key={milestone.id}
                    className={`bg-gradient-to-br ${colorScheme.bgColor} border-2 ${colorScheme.borderColor} hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                  >
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                    </div>
                    <CardContent className="p-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${colorScheme.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-center">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        {milestone.description}
                      </p>
                      <div className="text-center space-y-2">
                        <div className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full inline-block">
                          ✅ Completed
                        </div>
                        <p className="text-xs text-gray-500">
                          Completed on{" "}
                          {milestone.dateCompleted
                            ? new Date(
                                milestone.dateCompleted,
                              ).toLocaleDateString()
                            : "N/A"}
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-amber-700">
                            +{milestone.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {/* View More/Less Button */}
          {filterMilestones(completedMilestones, selectedCategory).length >
            3 && (
            <div className="text-center mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAllCompleted(!showAllCompleted)}
                className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showAllCompleted
                  ? `View Less (showing ${filterMilestones(completedMilestones, selectedCategory).length})`
                  : `View More (${filterMilestones(completedMilestones, selectedCategory).length - 3} more)`}
              </Button>
            </div>
          )}
        </section>
      )}

      {/* In Progress Milestones */}
      {filterMilestones(inProgressMilestones, selectedCategory).length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              🚀 In Progress
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterMilestones(inProgressMilestones, selectedCategory).map(
              (milestone) => {
                const Icon = getIconComponent(milestone.icon);
                const colorScheme = milestone.color_scheme;
                const progressPercentage = milestone.progressPercentage || 0;
                const currentProgress =
                  milestone.progress?.current_progress || 0;
                const targetValue = milestone.target_value || 1;
                return (
                  <Card
                    key={milestone.id}
                    className={`bg-gradient-to-br ${colorScheme.bgColor} border-2 ${colorScheme.borderColor} hover:shadow-lg transition-all duration-300`}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${colorScheme.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-center">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4 text-center">
                        {milestone.description}
                      </p>
                      <div className="space-y-3">
                        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${colorScheme.color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-center text-sm font-medium">
                          {currentProgress} / {targetValue}
                        </p>
                        <div className="flex items-center justify-center gap-1">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-amber-700">
                            +{milestone.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        </section>
      )}

      {/* Locked Milestones */}
      {filterMilestones(lockedMilestones, selectedCategory).length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
              🔒 Locked Achievements
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterMilestones(lockedMilestones, selectedCategory).map(
              (milestone) => {
                const Icon = getIconComponent(milestone.icon);
                const colorScheme = milestone.color_scheme;
                return (
                  <Card
                    key={milestone.id}
                    className={`bg-gradient-to-br ${colorScheme.bgColor} border-2 ${colorScheme.borderColor} opacity-75 relative`}
                  >
                    <div className="absolute top-2 right-2">
                      <Lock className="w-6 h-6 text-gray-500" />
                    </div>
                    <CardContent className="p-6">
                      <div
                        className={`w-16 h-16 bg-gradient-to-r ${colorScheme.color} rounded-full flex items-center justify-center mx-auto mb-4 opacity-50`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-center text-gray-500">
                        {milestone.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-4 text-center">
                        {milestone.description}
                      </p>
                      <div className="text-center space-y-2">
                        <div className="bg-gray-400 text-white text-xs px-3 py-1 rounded-full inline-block">
                          🔒 Locked
                        </div>
                        <p className="text-xs text-gray-500">
                          {milestone.requirement_text}
                        </p>
                        <div className="flex items-center justify-center gap-1 opacity-50">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-medium text-amber-700">
                            +{milestone.xp_reward} XP
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-vibrant-blue/10 via-scotland-thistle/10 to-vibrant-pink/10 rounded-2xl p-8 border border-scotland-thistle/20">
        <Award className="w-16 h-16 mx-auto mb-4 text-vibrant-blue" />
        <h2 className="text-2xl font-bold mb-4">
          <span className="bg-gradient-to-r from-vibrant-blue to-scotland-loch bg-clip-text text-transparent">
            Keep Exploring Scotland!
          </span>
        </h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Continue your Scottish adventure to unlock new milestones and earn XP.
          Every journey creates memories and brings you closer to becoming a
          true Highland Explorer!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-gradient-to-r from-vibrant-blue to-scotland-loch hover:from-vibrant-blue/90 hover:to-scotland-loch/90"
            onClick={() => (window.location.href = "/journal")}
          >
            <Eye className="mr-2 h-5 w-5" />
            Add Journal Entry
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/gallery")}
          >
            <Camera className="mr-2 h-5 w-5" />
            Upload Photos
          </Button>
        </div>
      </section>
    </div>
  );
}
