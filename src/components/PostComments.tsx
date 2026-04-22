import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { Loader2, MessageSquare, User } from 'lucide-react';

interface PostCommentsProps {
  issueTerm: string;
}

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: any;
}

export function PostComments({ issueTerm }: PostCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!issueTerm) return;

    const commentsRef = collection(db, `posts/${issueTerm}/comments`);
    const q = query(commentsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(fetchedComments);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching comments:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [issueTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) {
      setError('Please provide both name and comment.');
      return;
    }
    
    setError('');
    setSubmitting(true);

    try {
      const commentsRef = collection(db, `posts/${issueTerm}/comments`);
      await addDoc(commentsRef, {
        postId: issueTerm,
        authorName: authorName.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString() // We use ISO string here to strictly enforce our schema rule instead of serverTimestamp()
      });
      
      setAuthorName('');
      setContent('');
    } catch (err) {
      console.error("Error adding comment:", err);
      setError('Failed to post comment. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Comments ({comments.length})</h2>
      </div>
      
      <div className="bg-card w-full rounded-2xl p-6 sm:p-8 border border-border shadow-sm mb-12">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Leave a reply</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input 
              type="text" 
              placeholder="Your Name" 
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-background border-border max-w-sm"
              maxLength={50}
              required
            />
          </div>
          <div>
            <textarea
              className="flex w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y"
              placeholder="Join the discussion..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={1500}
              required
            />
          </div>
          
          {error && <p className="text-destructive text-sm bg-destructive/10 p-3 rounded-md border border-destructive/20">{error}</p>}
          
          <Button type="submit" disabled={submitting || !authorName.trim() || !content.trim()}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : "Post Comment"}
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group relative pl-4 border-l-2 border-border/50 hover:border-primary/50 transition-colors py-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex flex-shrink-0 items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{comment.authorName}</h4>
                  <p className="text-xs text-muted-foreground">
                    {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy • h:mm a') : 'Just now'}
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-none pl-11 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-12 px-4 border border-dashed border-border rounded-xl">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
}
