import { supabase, isSupabaseConfigured } from './supabase';
import { uploadPhotoToCloudflare, ProcessedPhoto } from './photoUtils';

/**
 * Supabase Family Members Service
 * Handles all database operations for family member profile pictures and data
 */

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  bio?: string;
  position_index: number;
  colors: {
    bg: string;
    border: string;
    accent: string;
  };
  has_custom_avatar?: boolean;
  display_avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateFamilyMemberData {
  name?: string;
  role?: string;
  avatar_url?: string;
  bio?: string;
  colors?: {
    bg: string;
    border: string;
    accent: string;
  };
}

/**
 * Get all family members
 */
export async function getFamilyMembers(): Promise<FamilyMember[]> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured - please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }

  try {
    console.log('🔄 Fetching family members...');

    const { data: members, error } = await supabase
      .from('family_members_with_stats')
      .select('*')
      .order('position_index', { ascending: true });

    if (error) {
      console.error('Error fetching family members:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        error
      });

      // Check if it's a table not found error
      if (error.message.includes('Could not find the table') ||
          error.message.includes('relation "family_members" does not exist') ||
          error.message.includes('relation "family_members_with_stats" does not exist') ||
          error.code === 'PGRST116') {
        throw new Error('SCHEMA_MISSING: Database tables not found');
      }
      throw new Error(`Failed to fetch family members: ${error.message}`);
    }

    console.log(`✅ Loaded ${members?.length || 0} family members`);
    return members || [];
  } catch (error) {
    console.error('Error in getFamilyMembers:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to fetch family members: ${String(error)}`);
  }
}

/**
 * Update a family member's avatar
 */
export async function updateFamilyMemberAvatar(id: string, avatarUrl: string): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🔄 Updating avatar for family member: ${id}...`);

    const { data: member, error } = await supabase
      .from('family_members')
      .update({ avatar_url: avatarUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating family member avatar:', error);
      throw new Error(`Failed to update avatar: ${error.message}`);
    }

    console.log(`✅ Avatar updated successfully: ${id}`);
    return member;
  } catch (error) {
    console.error('Error in updateFamilyMemberAvatar:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update avatar: ${String(error)}`);
  }
}

/**
 * Remove a family member's avatar
 */
export async function removeFamilyMemberAvatar(id: string): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🗑️ Removing avatar for family member: ${id}...`);

    const { data: member, error } = await supabase
      .from('family_members')
      .update({ avatar_url: null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error removing family member avatar:', error);
      throw new Error(`Failed to remove avatar: ${error.message}`);
    }

    console.log(`✅ Avatar removed successfully: ${id}`);
    return member;
  } catch (error) {
    console.error('Error in removeFamilyMemberAvatar:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to remove avatar: ${String(error)}`);
  }
}

/**
 * Update family member information
 */
export async function updateFamilyMember(id: string, updates: UpdateFamilyMemberData): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`🔄 Updating family member: ${id}...`);

    const { data: member, error } = await supabase
      .from('family_members')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating family member:', error);
      throw new Error(`Failed to update family member: ${error.message}`);
    }

    console.log(`✅ Family member updated successfully: ${id}`);
    return member;
  } catch (error) {
    console.error('Error in updateFamilyMember:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to update family member: ${String(error)}`);
  }
}

/**
 * Upload and set family member avatar
 */
export async function uploadFamilyMemberAvatar(
  memberId: string,
  processedPhoto: ProcessedPhoto,
  onProgress?: (progress: number) => void
): Promise<FamilyMember> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase not configured');
  }

  try {
    console.log(`📸 Uploading avatar for family member: ${memberId}...`);

    // Upload photo to Cloudflare
    const cloudflareUrl = await uploadPhotoToCloudflare(processedPhoto, onProgress);

    // Update family member with new avatar URL
    const updatedMember = await updateFamilyMemberAvatar(memberId, cloudflareUrl);

    console.log(`✅ Avatar uploaded and updated successfully: ${memberId}`);
    return updatedMember;
  } catch (error) {
    console.error('Error in uploadFamilyMemberAvatar:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to upload avatar: ${String(error)}`);
  }
}

/**
 * Subscribe to real-time changes in family members
 */
export function subscribeToFamilyMembers(
  callback: (members: FamilyMember[]) => void
) {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, skipping real-time subscription');
    return () => {}; // Return empty unsubscribe function
  }

  console.log('🔄 Setting up real-time family members sync...');
  
  const subscription = supabase
    .channel('family_members_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'family_members'
      },
      async (payload) => {
        console.log('📡 Real-time family member change detected:', payload.eventType);
        
        // Refetch all family members when any change occurs
        try {
          const members = await getFamilyMembers();
          callback(members);
          console.log('✅ Family members sync updated with latest data');
        } catch (error) {
          console.error('Error in real-time family members subscription:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Family members subscription status:', status);
    });

  console.log('✅ Real-time family members sync enabled');

  return () => {
    console.log('🔌 Unsubscribing from family members changes');
    subscription.unsubscribe();
  };
}

/**
 * Test Supabase connection for family members data
 */
export async function testFamilyMembersConnection(): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase not configured',
      error: 'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    };
  }

  try {
    console.log('🔍 Testing family members database connection...');

    const { data, error, count } = await supabase
      .from('family_members')
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('Could not find the table') || 
          error.message.includes('relation "family_members" does not exist')) {
        return {
          success: false,
          message: 'Database tables not found - please run family-members-schema.sql',
          error: 'Tables missing: family_members'
        };
      }
      return {
        success: false,
        message: 'Database connection failed',
        error: error.message
      };
    }

    const memberCount = count || 0;
    return {
      success: true,
      message: `✅ Family members database connected! Found ${memberCount} member${memberCount !== 1 ? 's' : ''}.`
    };
  } catch (error) {
    return {
      success: false,
      message: 'Connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
