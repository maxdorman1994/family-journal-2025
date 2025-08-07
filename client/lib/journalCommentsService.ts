import { supabase } from './supabase';

export interface JournalComment {
  id: string;
  journal_entry_id: string;
  visitor_name: string;
  comment_text: string;
  created_at: string;
}

export interface JournalLike {
  id: string;
  journal_entry_id: string;
  visitor_name: string;
  created_at: string;
}

export interface JournalEntryStats {
  id: string;
  title: string;
  created_at: string;
  comment_count: number;
  like_count: number;
}

// Comments functions
export async function getCommentsForEntry(entryId: string): Promise<JournalComment[]> {
  try {
    const { data, error } = await supabase
      .from('journal_comments')
      .select('*')
      .eq('journal_entry_id', entryId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCommentsForEntry:', error);
    throw error;
  }
}

export async function addComment(entryId: string, visitorName: string, commentText: string): Promise<JournalComment> {
  try {
    if (!visitorName.trim() || !commentText.trim()) {
      throw new Error('Visitor name and comment text are required');
    }

    const { data, error } = await supabase
      .from('journal_comments')
      .insert({
        journal_entry_id: entryId,
        visitor_name: visitorName.trim(),
        comment_text: commentText.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addComment:', error);
    throw error;
  }
}

export async function deleteComment(commentId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('journal_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteComment:', error);
    throw error;
  }
}

// Likes functions
export async function getLikesForEntry(entryId: string): Promise<JournalLike[]> {
  try {
    const { data, error } = await supabase
      .from('journal_likes')
      .select('*')
      .eq('journal_entry_id', entryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching likes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLikesForEntry:', error);
    throw error;
  }
}

export async function toggleLike(entryId: string, visitorName: string): Promise<{ liked: boolean; likeCount: number }> {
  try {
    if (!visitorName.trim()) {
      throw new Error('Visitor name is required');
    }

    // Check if user already liked this entry
    const { data: existingLike, error: checkError } = await supabase
      .from('journal_likes')
      .select('id')
      .eq('journal_entry_id', entryId)
      .eq('visitor_name', visitorName.trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing like:', checkError);
      throw checkError;
    }

    let liked = false;

    if (existingLike) {
      // Unlike - remove the like
      const { error: deleteError } = await supabase
        .from('journal_likes')
        .delete()
        .eq('id', existingLike.id);

      if (deleteError) {
        console.error('Error removing like:', deleteError);
        throw deleteError;
      }
      liked = false;
    } else {
      // Like - add the like
      const { error: insertError } = await supabase
        .from('journal_likes')
        .insert({
          journal_entry_id: entryId,
          visitor_name: visitorName.trim(),
        });

      if (insertError) {
        console.error('Error adding like:', insertError);
        throw insertError;
      }
      liked = true;
    }

    // Get updated like count
    const { data: likeCountData, error: countError } = await supabase
      .from('journal_likes')
      .select('id')
      .eq('journal_entry_id', entryId);

    if (countError) {
      console.error('Error getting like count:', countError);
      throw countError;
    }

    return {
      liked,
      likeCount: likeCountData?.length || 0,
    };
  } catch (error) {
    console.error('Error in toggleLike:', error);
    throw error;
  }
}

export async function checkIfUserLiked(entryId: string, visitorName: string): Promise<boolean> {
  try {
    if (!visitorName.trim()) {
      return false;
    }

    const { data, error } = await supabase
      .from('journal_likes')
      .select('id')
      .eq('journal_entry_id', entryId)
      .eq('visitor_name', visitorName.trim())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking if user liked:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in checkIfUserLiked:', error);
    return false;
  }
}

// Stats functions
export async function getEntryStats(entryId: string): Promise<{ commentCount: number; likeCount: number }> {
  try {
    const { data, error } = await supabase
      .from('journal_entry_stats')
      .select('comment_count, like_count')
      .eq('id', entryId)
      .single();

    if (error) {
      console.error('Error fetching entry stats:', error);
      // Fallback to individual queries if view doesn't exist yet
      const [comments, likes] = await Promise.all([
        getCommentsForEntry(entryId),
        getLikesForEntry(entryId),
      ]);
      
      return {
        commentCount: comments.length,
        likeCount: likes.length,
      };
    }

    return {
      commentCount: data.comment_count || 0,
      likeCount: data.like_count || 0,
    };
  } catch (error) {
    console.error('Error in getEntryStats:', error);
    return { commentCount: 0, likeCount: 0 };
  }
}

export async function getAllEntryStats(): Promise<JournalEntryStats[]> {
  try {
    const { data, error } = await supabase
      .from('journal_entry_stats')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all entry stats:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllEntryStats:', error);
    throw error;
  }
}
