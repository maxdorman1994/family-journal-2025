import { useState, useEffect } from "react";
import {
  X,
  Upload,
  MapPin,
  Calendar,
  Cloud,
  Heart,
  Route,
  Car,
  Dog,
  Tag,
  Camera,
  Plus,
  Ticket,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import PhotoUpload from "@/components/PhotoUpload";
import { ProcessedPhoto, cleanupPreviewUrls } from "@/lib/photoUtils";
import { JournalEntry } from "@/lib/supabase";

interface NewEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (entry: any) => Promise<void>;
  editingEntry?: JournalEntry | null;
}

const weatherOptions = [
  { value: "☀️ Sunny", label: "☀️ Sunny" },
  { value: "⛅ Partly Cloudy", label: "⛅ Partly Cloudy" },
  { value: "��️ Cloudy", label: "☁️ Cloudy" },
  { value: "🌧️ Light Rain", label: "🌧️ Light Rain" },
  { value: "🌦️ Showers", label: "🌦️ Showers" },
  { value: "❄️ Snow", label: "❄️ Snow" },
  { value: "🌫️ Foggy", label: "🌫️ Foggy" },
  { value: "💨 Windy", label: "💨 Windy" },
];

const moodOptions = [
  { value: "🙏 Grateful", label: "🙏 Grateful" },
  { value: "😌 Peaceful", label: "😌 Peaceful" },
  { value: "🤩 Amazed", label: "🤩 Amazed" },
  { value: "😄 Happy", label: "😄 Happy" },
  { value: "😊 Content", label: "😊 Content" },
  { value: "🥰 Loved", label: "🥰 Loved" },
  { value: "😴 Tired", label: "😴 Tired" },
  { value: "🤗 Blessed", label: "🤗 Blessed" },
];

const commonTags = [
  "Mountain",
  "Lake",
  "City",
  "Family",
  "Challenge",
  "Views",
  "History",
  "Culture",
  "Nature",
  "Relaxing",
  "Adventure",
  "Castle",
  "Forest",
  "Beach",
  "Island",
  "Village",
  "Hiking",
  "Photography",
  "Wildlife",
];

export default function NewEntryForm({
  isOpen,
  onClose,
  onSubmit,
  editingEntry,
}: NewEntryFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    weather: "",
    mood: "",
    miles_traveled: "",
    parking: "",
    dog_friendly: false,
    paid_activity: false,
    adult_tickets: "",
    child_tickets: "",
    other_tickets: "",
    pet_notes: "",
    content: "",
    tags: [] as string[],
    photos: [] as ProcessedPhoto[],
  });

  const [customTag, setCustomTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form data when editing an entry
  useEffect(() => {
    if (editingEntry) {
      console.log("🔧 Populating form for editing:", editingEntry);
      setFormData({
        title: editingEntry.title || "",
        date: editingEntry.date
          ? new Date(editingEntry.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        location: editingEntry.location || "",
        weather: editingEntry.weather || "",
        mood: editingEntry.mood || "",
        miles_traveled: editingEntry.miles_traveled?.toString() || "",
        parking: editingEntry.parking || "",
        dog_friendly: editingEntry.dog_friendly || false,
        paid_activity: editingEntry.paid_activity || false,
        adult_tickets: editingEntry.adult_tickets || "",
        child_tickets: editingEntry.child_tickets || "",
        other_tickets: editingEntry.other_tickets || "",
        pet_notes: editingEntry.pet_notes || "",
        content: editingEntry.content || "",
        tags: editingEntry.tags || [],
        photos: [], // Photos will need special handling for existing entries
      });
    } else {
      // Reset form for new entry
      setFormData({
        title: "",
        date: new Date().toISOString().split("T")[0],
        location: "",
        weather: "",
        mood: "",
        miles_traveled: "",
        parking: "",
        dog_friendly: false,
        paid_activity: false,
        adult_tickets: "",
        child_tickets: "",
        other_tickets: "",
        pet_notes: "",
        content: "",
        tags: [],
        photos: [],
      });
    }
  }, [editingEntry]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      handleTagToggle(customTag.trim());
      setCustomTag("");
    }
  };

  const handlePhotosChange = (photos: ProcessedPhoto[]) => {
    setFormData((prev) => ({
      ...prev,
      photos,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.content.trim())
      newErrors.content = "Adventure story is required";
    if (!formData.weather) newErrors.weather = "Weather is required";
    if (!formData.mood) newErrors.mood = "Mood is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Form submission started", {
      editingEntry: !!editingEntry,
      formData,
    });
    console.log("🔍 Checking required fields:", {
      title: formData.title,
      location: formData.location,
      content: formData.content,
      weather: formData.weather,
      mood: formData.mood,
    });

    if (validateForm()) {
      console.log("✅ Validation passed, proceeding with save...");
      try {
        setIsSubmitting(true);
        console.log("✅ Form validation passed, submitting...");

        // Check if we have photos that need uploading
        const photosNeedUploading = formData.photos.some(
          (photo) => !photo.cloudflareUrl,
        );
        if (photosNeedUploading) {
          console.log("Photos detected, will upload during entry creation...");
        }

        // Submit the form data (photos will be uploaded in handleSaveEntry)
        console.log("🚀 Calling onSubmit with data:", formData);
        await onSubmit(formData);

        // Clean up photo preview URLs only after successful submission
        cleanupPreviewUrls(formData.photos);

        // Reset form only for new entries (not edits)
        if (!editingEntry) {
          setFormData({
            title: "",
            date: new Date().toISOString().split("T")[0],
            location: "",
            weather: "",
            mood: "",
            miles_traveled: "",
            parking: "",
            dog_friendly: false,
            paid_activity: false,
            adult_tickets: "",
            child_tickets: "",
            other_tickets: "",
            pet_notes: "",
            content: "",
            tags: [],
            photos: [],
          });
        }

        console.log("✅ Form submission completed successfully");
        // Don't call onClose() here - let the parent handle it after successful save
      } catch (error) {
        console.error("Failed to submit entry:", error);
        setErrors({ submit: "Failed to save entry. Please try again." });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log("❌ Validation failed. Errors:", errors);
      console.log("❌ Form data when validation failed:", formData);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-vibrant-blue via-scotland-loch to-vibrant-teal bg-clip-text text-transparent">
              {editingEntry
                ? "Edit Adventure Entry"
                : "Create New Adventure Entry"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Adventure Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="e.g., Ben Nevis Summit - Our Greatest Challenge Yet!"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formData.date && formatDate(formData.date)}
              </p>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location *</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                placeholder="e.g., Fort William, Highland"
                className={`pl-10 ${errors.location ? "border-red-500" : ""}`}
              />
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Weather and Mood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Weather *
              </label>
              <Select
                value={formData.weather}
                onValueChange={(value) => handleInputChange("weather", value)}
              >
                <SelectTrigger
                  className={errors.weather ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {weatherOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.weather && (
                <p className="text-red-500 text-sm mt-1">{errors.weather}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mood *</label>
              <Select
                value={formData.mood}
                onValueChange={(value) => handleInputChange("mood", value)}
              >
                <SelectTrigger className={errors.mood ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {moodOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.mood && (
                <p className="text-red-500 text-sm mt-1">{errors.mood}</p>
              )}
            </div>
          </div>

          {/* Travel Details */}
          <Card className="bg-scotland-mist/20 border-scotland-thistle/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Route className="mr-2 h-5 w-5 text-vibrant-blue" />
                Travel Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Travel Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Miles Traveled
                  </label>
                  <Input
                    type="number"
                    value={formData.miles_traveled}
                    onChange={(e) =>
                      handleInputChange("miles_traveled", e.target.value)
                    }
                    placeholder="e.g., 87"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Parking
                  </label>
                  <Input
                    value={formData.parking}
                    onChange={(e) =>
                      handleInputChange("parking", e.target.value)
                    }
                    placeholder="e.g., Free or £5"
                  />
                </div>
              </div>

              {/* Paid Activity Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paid_activity"
                    checked={formData.paid_activity}
                    onCheckedChange={(checked) =>
                      handleInputChange("paid_activity", checked)
                    }
                  />
                  <label
                    htmlFor="paid_activity"
                    className="text-sm font-medium flex items-center"
                  >
                    <Ticket className="mr-1 h-4 w-4 text-vibrant-blue" />
                    Paid Activity
                  </label>
                </div>

                {formData.paid_activity && (
                  <div className="ml-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white/50 rounded-lg border border-scotland-thistle/20">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Adult Tickets
                      </label>
                      <Input
                        value={formData.adult_tickets}
                        onChange={(e) =>
                          handleInputChange("adult_tickets", e.target.value)
                        }
                        placeholder="e.g., £12 each or 2 × £12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Child Tickets
                      </label>
                      <Input
                        value={formData.child_tickets}
                        onChange={(e) =>
                          handleInputChange("child_tickets", e.target.value)
                        }
                        placeholder="e.g., £6 each or 1 × £6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Other Tickets
                      </label>
                      <Input
                        value={formData.other_tickets}
                        onChange={(e) =>
                          handleInputChange("other_tickets", e.target.value)
                        }
                        placeholder="e.g., Senior £8 or Family £30"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pet-Friendly Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="dog_friendly"
                    checked={formData.dog_friendly}
                    onCheckedChange={(checked) =>
                      handleInputChange("dog_friendly", checked)
                    }
                  />
                  <label
                    htmlFor="dog_friendly"
                    className="text-sm font-medium flex items-center"
                  >
                    <Dog className="mr-1 h-4 w-4 text-vibrant-pink" />
                    Pet-friendly location
                  </label>
                </div>

                {formData.dog_friendly && (
                  <div className="ml-6">
                    <label className="block text-sm font-medium mb-2">
                      Pet Notes & Requirements
                    </label>
                    <Input
                      value={formData.pet_notes}
                      onChange={(e) =>
                        handleInputChange("pet_notes", e.target.value)
                      }
                      placeholder="e.g., Dogs must be kept on leads, £2 dog entry fee, water bowls available"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Note any special requirements, restrictions, or facilities
                      for pets
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photos Upload */}
          <Card className="bg-gradient-to-br from-vibrant-blue/5 to-scotland-loch/5 border-vibrant-blue/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Camera className="mr-2 h-5 w-5 text-vibrant-blue" />
                Adventure Photos ({formData.photos.length}/8)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                photos={formData.photos}
                onPhotosChange={handlePhotosChange}
                maxPhotos={20}
              />
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="bg-gradient-to-br from-vibrant-pink/5 to-scotland-heather/5 border-vibrant-pink/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Tag className="mr-2 h-5 w-5 text-vibrant-pink" />
                Memory Tags ({formData.tags.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                {commonTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <span className="text-sm">{tag}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addCustomTag())
                  }
                />
                <Button type="button" variant="outline" onClick={addCustomTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-scotland-thistle/20 text-scotland-thistle text-sm rounded-full cursor-pointer hover:bg-scotland-thistle/30 transition-colors"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag} ×
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Adventure Story */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Adventure Story *
            </label>
            <Textarea
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="Tell us about your adventure! What made it special? What did you see and experience? Share the memories that made this day unforgettable..."
              rows={6}
              className={errors.content ? "border-red-500" : ""}
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Share the full story of your adventure. This will be the heart of
              your journal entry.
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {errors.submit}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-vibrant-blue to-scotland-loch hover:from-vibrant-blue/90 hover:to-scotland-loch/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {formData.photos.length > 0
                    ? "Uploading Photos..."
                    : "Saving..."}
                </>
              ) : editingEntry ? (
                "Update Adventure"
              ) : (
                "Save Adventure"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
