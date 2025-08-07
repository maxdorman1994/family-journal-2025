// Simple test to verify all our imports work correctly
import { 
  getCommentsForEntry,
  getLikesForEntry,
  addComment,
  deleteComment,
  deleteLike,
  toggleLike,
  checkIfUserLiked,
  getEntryStats,
  checkCommentsLikesTables,
  type JournalComment,
  type JournalLike,
} from './client/lib/journalCommentsService';

// Test that all functions are properly exported
console.log('✅ All functions imported successfully:', {
  getCommentsForEntry: typeof getCommentsForEntry,
  getLikesForEntry: typeof getLikesForEntry,
  addComment: typeof addComment,
  deleteComment: typeof deleteComment,
  deleteLike: typeof deleteLike,
  toggleLike: typeof toggleLike,
  checkIfUserLiked: typeof checkIfUserLiked,
  getEntryStats: typeof getEntryStats,
  checkCommentsLikesTables: typeof checkCommentsLikesTables,
});

// Test type definitions
const testComment: JournalComment = {
  id: 'test',
  journal_entry_id: 'test',
  visitor_name: 'test',
  comment_text: 'test',
  created_at: new Date().toISOString(),
};

const testLike: JournalLike = {
  id: 'test',
  journal_entry_id: 'test',
  visitor_name: 'test',
  created_at: new Date().toISOString(),
};

console.log('✅ Type definitions work correctly');
