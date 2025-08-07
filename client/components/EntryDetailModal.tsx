import React from "react";
import { X, MapPin, Route, Car, Dog, Ticket, Calendar, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { JournalEntry } from "@/lib/supabase";
import JournalCommentsLikes from "./JournalCommentsLikes";

interface EntryDetailModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EntryDetailModal({ entry, isOpen, onClose }: EntryDetailModalProps) {
  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-800 pr-8">
            {entry.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Entry Header */}
          <div className="border-b border-scotland-thistle/20 pb-4">
            <div className="flex items-center gap-4 text-muted-foreground mb-2">
              <div className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {entry.date}
              </div>
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {entry.location}
              </div>
            </div>
            
            {/* Weather and Mood */}
            <div className="flex gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {entry.weather}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {entry.mood}
              </span>
            </div>
          </div>

          {/* Travel Information */}
          <Card className="bg-scotland-mist/30 border-scotland-thistle/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Route className="mr-2 h-4 w-4" />
                Travel Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Route className="mr-2 h-4 w-4 text-vibrant-blue" />
                  <span className="font-medium">{entry.miles_traveled} miles traveled</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Car className="mr-2 h-4 w-4 text-scotland-forest" />
                  <span className="font-medium">Parking: {entry.parking}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Dog className="mr-2 h-4 w-4 text-vibrant-pink" />
                  <span className="font-medium">
                    {entry.dog_friendly ? "🐕 Dog friendly" : "❌ No dogs"}
                  </span>
                </div>
              </div>

              {/* Pet Notes */}
              {entry.dog_friendly && entry.pet_notes && (
                <div className="mt-4 text-sm text-gray-600 italic border-l-2 border-vibrant-pink pl-3 bg-white/50 p-3 rounded">
                  <span className="font-medium">Pet info: </span>{entry.pet_notes}
                </div>
              )}

              {/* Ticket Information */}
              {entry.paid_activity && (entry.adult_tickets || entry.child_tickets || entry.other_tickets) && (
                <div className="mt-4 text-sm text-gray-600 border-l-2 border-vibrant-blue pl-3 bg-white/50 p-3 rounded">
                  <span className="font-medium flex items-center mb-2">
                    <Ticket className="mr-1 h-3 w-3" />
                    Tickets:
                  </span>
                  <div className="space-y-1">
                    {entry.adult_tickets && <div><strong>Adults:</strong> {entry.adult_tickets}</div>}
                    {entry.child_tickets && <div><strong>Children:</strong> {entry.child_tickets}</div>}
                    {entry.other_tickets && <div><strong>Other:</strong> {entry.other_tickets}</div>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Full Photo Gallery */}
          {entry.photos && entry.photos.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <Eye className="mr-2 h-4 w-4" />
                All Photos ({entry.photos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {entry.photos.map((photo, photoIndex) => (
                  <div key={photoIndex} className="relative aspect-square rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group">
                    <img
                      src={photo}
                      alt={`Photo ${photoIndex + 1} from ${entry.title}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="px-3 py-1 bg-scotland-thistle/20 text-scotland-thistle text-sm rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Full Content */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Our Adventure Story</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>
          </div>

          {/* Comments and Likes */}
          <div className="border-t border-scotland-thistle/20 pt-6">
            <JournalCommentsLikes
              entryId={entry.id}
              entryTitle={entry.title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
