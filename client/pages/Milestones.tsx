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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Milestones() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Completed Milestones
  const completedMilestones = [
    {
      id: "first-adventure",
      title: "First Adventure",
      description: "Started your Scottish exploration journey",
      icon: MapPin,
      category: "exploration",
      dateCompleted: "2025-01-10",
      xpReward: 100,
      color: "from-blue-500 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-100",
      borderColor: "border-blue-200/60",
    },
    {
      id: "photo-memories",
      title: "Photo Memories",
      description: "Captured your first Scottish moments",
      icon: Camera,
      category: "photography",
      dateCompleted: "2025-01-10",
      xpReward: 75,
      color: "from-purple-500 to-violet-600",
      bgColor: "from-purple-50 to-violet-100",
      borderColor: "border-purple-200/60",
    },
    {
      id: "family-adventure",
      title: "Family Adventure",
      description: "Shared memories with loved ones",
      icon: Heart,
      category: "family",
      dateCompleted: "2025-01-10",
      xpReward: 125,
      color: "from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-rose-100",
      borderColor: "border-pink-200/60",
    },
    {
      id: "first-month",
      title: "First Month Complete",
      description: "Completed your first month of Scottish exploration",
      icon: Calendar,
      category: "time",
      dateCompleted: "2025-01-15",
      xpReward: 200,
      color: "from-emerald-500 to-teal-600",
      bgColor: "from-emerald-50 to-teal-100",
      borderColor: "border-emerald-200/60",
    },
  ];

  // In Progress Milestones
  const inProgressMilestones = [
    {
      id: "highland-explorer",
      title: "Highland Explorer",
      description: "Visit 5 different Scottish locations",
      icon: Mountain,
      category: "exploration",
      progress: 1,
      target: 5,
      xpReward: 300,
      color: "from-amber-500 to-orange-600",
      bgColor: "from-amber-50 to-orange-100",
      borderColor: "border-amber-200/60",
    },
    {
      id: "photo-collector",
      title: "Photo Collector",
      description: "Take 50 photos during your adventures",
      icon: Camera,
      category: "photography",
      progress: 12,
      target: 50,
      xpReward: 250,
      color: "from-indigo-500 to-purple-600",
      bgColor: "from-indigo-50 to-purple-100",
      borderColor: "border-indigo-200/60",
    },
    {
      id: "journal-keeper",
      title: "Journal Keeper",
      description: "Write 10 journal entries",
      icon: Eye,
      category: "documentation",
      progress: 1,
      target: 10,
      xpReward: 200,
      color: "from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-emerald-100",
      borderColor: "border-green-200/60",
    },
  ];

  // Locked Future Milestones
  const lockedMilestones = [
    {
      id: "castle-conqueror",
      title: "Castle Conqueror",
      description: "Visit 3 Scottish castles",
      icon: Trophy,
      category: "exploration",
      requirement: "Complete Highland Explorer first",
      xpReward: 400,
      color: "from-gray-400 to-gray-500",
      bgColor: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200/60",
    },
    {
      id: "munro-beginner",
      title: "Munro Beginner",
      description: "Climb your first Munro",
      icon: Mountain,
      category: "adventure",
      requirement: "Complete Highland Explorer first",
      xpReward: 500,
      color: "from-gray-400 to-gray-500",
      bgColor: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200/60",
    },
    {
      id: "loch-legend",
      title: "Loch Legend",
      description: "Visit 5 different Scottish lochs",
      icon: Map,
      category: "exploration",
      requirement: "Complete Highland Explorer first",
      xpReward: 350,
      color: "from-gray-400 to-gray-500",
      bgColor: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200/60",
    },
    {
      id: "family-historian",
      title: "Family Historian",
      description: "Document 25 family adventures",
      icon: Users,
      category: "family",
      requirement: "Complete Journal Keeper first",
      xpReward: 300,
      color: "from-gray-400 to-gray-500",
      bgColor: "from-gray-50 to-gray-100",
      borderColor: "border-gray-200/60",
    },
  ];

  const categories = [
    { id: "all", name: "All", icon: Star },
    { id: "exploration", name: "Exploration", icon: MapPin },
    { id: "photography", name: "Photography", icon: Camera },
    { id: "family", name: "Family", icon: Heart },
    { id: "adventure", name: "Adventure", icon: Mountain },
    { id: "documentation", name: "Documentation", icon: Eye },
    { id: "time", name: "Time", icon: Calendar },
  ];

  const totalXP = completedMilestones.reduce((sum, milestone) => sum + milestone.xpReward, 0);
  const completedCount = completedMilestones.length;
  const totalMilestones = completedMilestones.length + inProgressMilestones.length + lockedMilestones.length;

  const filterMilestones = (milestones: any[], category: string) => {
    if (category === "all") return milestones;
    return milestones.filter(m => m.category === category);
  };

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
          Track your progress, celebrate achievements, and unlock new adventures as you explore Scotland!
        </p>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-100 border-2 border-emerald-200/60">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-1">{completedCount}</h3>
              <p className="text-sm text-emerald-600">Completed Milestones</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-100 border-2 border-amber-200/60">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-amber-800 mb-1">{totalXP}</h3>
              <p className="text-sm text-amber-600">Total XP Earned</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200/60">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-1">{Math.round((completedCount / totalMilestones) * 100)}%</h3>
              <p className="text-sm text-blue-600">Progress Complete</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
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
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterMilestones(completedMilestones, selectedCategory).map((milestone) => {
              const Icon = milestone.icon;
              return (
                <Card
                  key={milestone.id}
                  className={`bg-gradient-to-br ${milestone.bgColor} border-2 ${milestone.borderColor} hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                >
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${milestone.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-center">{milestone.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 text-center">{milestone.description}</p>
                    <div className="text-center space-y-2">
                      <div className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full inline-block">
                        ✅ Completed
                      </div>
                      <p className="text-xs text-gray-500">Completed on {new Date(milestone.dateCompleted).toLocaleDateString()}</p>
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700">+{milestone.xpReward} XP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
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
            {filterMilestones(inProgressMilestones, selectedCategory).map((milestone) => {
              const Icon = milestone.icon;
              const progressPercentage = (milestone.progress / milestone.target) * 100;
              return (
                <Card
                  key={milestone.id}
                  className={`bg-gradient-to-br ${milestone.bgColor} border-2 ${milestone.borderColor} hover:shadow-lg transition-all duration-300`}
                >
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${milestone.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-center">{milestone.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 text-center">{milestone.description}</p>
                    <div className="space-y-3">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${milestone.color} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <p className="text-center text-sm font-medium">
                        {milestone.progress} / {milestone.target}
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700">+{milestone.xpReward} XP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
            {filterMilestones(lockedMilestones, selectedCategory).map((milestone) => {
              const Icon = milestone.icon;
              return (
                <Card
                  key={milestone.id}
                  className={`bg-gradient-to-br ${milestone.bgColor} border-2 ${milestone.borderColor} opacity-75 relative`}
                >
                  <div className="absolute top-2 right-2">
                    <Lock className="w-6 h-6 text-gray-500" />
                  </div>
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-r ${milestone.color} rounded-full flex items-center justify-center mx-auto mb-4 opacity-50`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-center text-gray-500">{milestone.title}</h3>
                    <p className="text-sm text-gray-400 mb-4 text-center">{milestone.description}</p>
                    <div className="text-center space-y-2">
                      <div className="bg-gray-400 text-white text-xs px-3 py-1 rounded-full inline-block">
                        🔒 Locked
                      </div>
                      <p className="text-xs text-gray-500">{milestone.requirement}</p>
                      <div className="flex items-center justify-center gap-1 opacity-50">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-amber-700">+{milestone.xpReward} XP</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
          Continue your Scottish adventure to unlock new milestones and earn XP. Every journey creates memories and brings you closer to becoming a true Highland Explorer!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="bg-gradient-to-r from-vibrant-blue to-scotland-loch hover:from-vibrant-blue/90 hover:to-scotland-loch/90"
            onClick={() => window.location.href = '/journal'}
          >
            <Eye className="mr-2 h-5 w-5" />
            Add Journal Entry
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/gallery'}
          >
            <Camera className="mr-2 h-5 w-5" />
            Upload Photos
          </Button>
        </div>
      </section>
    </div>
  );
}
