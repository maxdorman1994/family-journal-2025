import { GraphQLClient } from 'graphql-request';

// Hasura configuration
const hasuraUrl = import.meta.env.VITE_HASURA_GRAPHQL_URL || "";
const hasuraAdminSecret = import.meta.env.VITE_HASURA_ADMIN_SECRET || "";

console.log("🔧 Hasura Configuration Check:", {
  hasUrl: !!hasuraUrl,
  hasSecret: !!hasuraAdminSecret,
  urlFormat: hasuraUrl
    ? hasuraUrl.startsWith("https://")
      ? "Valid HTTPS URL"
      : "Invalid URL format"
    : "Missing",
});

if (!hasuraUrl) {
  console.warn(
    "⚠️  Hasura configuration missing. Please set VITE_HASURA_GRAPHQL_URL",
  );
}

// Create Hasura GraphQL client
export const hasuraClient = new GraphQLClient(hasuraUrl, {
  headers: hasuraAdminSecret
    ? {
        'x-hasura-admin-secret': hasuraAdminSecret,
      }
    : {},
});

// Database types for Hasura tables (same as before)
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  location: string;
  weather: string;
  mood: string;
  miles_traveled: number;
  parking: string;
  dog_friendly: boolean;
  paid_activity: boolean;
  adult_tickets: string;
  child_tickets: string;
  other_tickets: string;
  pet_notes: string;
  tags: string[];
  photos: string[]; // Array of Cloudflare R2 URLs
  created_at?: string;
  updated_at?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  position_index: number;
  colors: any;
  created_at?: string;
  updated_at?: string;
}

export interface AdventureStat {
  id: string;
  stat_type: string;
  stat_value: number;
  stat_description?: string;
  last_updated: string;
  created_at: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  location: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Planning' | 'Researching' | 'Ready' | 'Booked';
  estimated_cost: number;
  best_seasons: string[];
  duration: string;
  category: string;
  family_votes: number;
  notes: string;
  target_date?: string;
  researched: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessedPhoto {
  id: string;
  file: File;
  originalFile: File;
  preview: string;
  isProcessing: boolean;
  uploadProgress: number;
  cloudflareUrl?: string; // R2 URL
  error?: string;
}

// GraphQL Queries
export const GET_JOURNAL_ENTRIES = `
  query GetJournalEntries {
    journal_entries(order_by: {date: desc}) {
      id
      title
      content
      date
      location
      weather
      mood
      miles_traveled
      parking
      dog_friendly
      paid_activity
      adult_tickets
      child_tickets
      other_tickets
      pet_notes
      tags
      photos
      created_at
      updated_at
    }
  }
`;

export const GET_RECENT_ADVENTURES = `
  query GetRecentAdventures {
    recent_adventures {
      id
      title
      location
      formatted_date
      featured_image
      tags
      excerpt
      photo_count
      tag_count
    }
  }
`;

export const GET_FAMILY_MEMBERS = `
  query GetFamilyMembers {
    family_members_with_stats(order_by: {position_index: asc}) {
      id
      name
      role
      bio
      display_avatar
      colors
      position_index
    }
  }
`;

export const GET_ADVENTURE_STATS = `
  query GetAdventureStats {
    adventure_stats_summary(order_by: {display_order: asc}) {
      stat_type
      stat_value
      stat_description
      last_updated
      is_primary_stat
    }
  }
`;

export const GET_PRIMARY_STATS = `
  query GetPrimaryStats {
    primary_adventure_stats {
      stat_type
      stat_value
      stat_description
      last_updated
    }
  }
`;

export const GET_WISHLIST_ITEMS = `
  query GetWishlistItems {
    wishlist_items(order_by: {family_votes: desc}) {
      id
      title
      location
      description
      priority
      status
      estimated_cost
      best_seasons
      duration
      category
      family_votes
      notes
      target_date
      researched
      created_at
      updated_at
    }
  }
`;

export const INSERT_JOURNAL_ENTRY = `
  mutation InsertJournalEntry($entry: journal_entries_insert_input!) {
    insert_journal_entries_one(object: $entry) {
      id
      title
      content
      date
      location
      weather
      mood
      miles_traveled
      parking
      dog_friendly
      paid_activity
      adult_tickets
      child_tickets
      other_tickets
      pet_notes
      tags
      photos
      created_at
      updated_at
    }
  }
`;

export const UPDATE_JOURNAL_ENTRY = `
  mutation UpdateJournalEntry($id: uuid!, $entry: journal_entries_set_input!) {
    update_journal_entries_by_pk(pk_columns: {id: $id}, _set: $entry) {
      id
      title
      content
      date
      location
      weather
      mood
      miles_traveled
      parking
      dog_friendly
      paid_activity
      adult_tickets
      child_tickets
      other_tickets
      pet_notes
      tags
      photos
      created_at
      updated_at
    }
  }
`;

export const DELETE_JOURNAL_ENTRY = `
  mutation DeleteJournalEntry($id: uuid!) {
    delete_journal_entries_by_pk(id: $id) {
      id
    }
  }
`;

/**
 * Check if Hasura is properly configured
 */
export function isHasuraConfigured(): boolean {
  return Boolean(hasuraUrl);
}

/**
 * Get Hasura configuration status
 */
export function getHasuraStatus(): {
  configured: boolean;
  message: string;
  url?: string;
} {
  if (!hasuraUrl) {
    return {
      configured: false,
      message:
        "Hasura not configured. Please set VITE_HASURA_GRAPHQL_URL environment variable.",
    };
  }

  return {
    configured: true,
    message: "Hasura configured successfully",
    url: hasuraUrl,
  };
}

/**
 * Execute GraphQL query
 */
export async function executeQuery<T = any>(
  query: string,
  variables?: any
): Promise<T> {
  try {
    const data = await hasuraClient.request<T>(query, variables);
    return data;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
}

/**
 * Execute GraphQL mutation
 */
export async function executeMutation<T = any>(
  mutation: string,
  variables?: any
): Promise<T> {
  try {
    const data = await hasuraClient.request<T>(mutation, variables);
    return data;
  } catch (error) {
    console.error('GraphQL mutation error:', error);
    throw error;
  }
}
