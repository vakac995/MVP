import { MessageSquare, Send, Reply, Trash2, Pencil } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { commentServiceCreateComment } from "@/lib/sdk";
import { Comment } from "@/lib/sdk";
import { useAuthContext } from "@/auth/AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface CommentSectionProps {
  projectId: string;
  timelineItemId?: string;
  comments: Comment[];
  onCommentAdded: () => void;
}

export default function CommentSection({ 
  projectId, 
  timelineItemId, 
  comments, 
  onCommentAdded 
}: CommentSectionProps) {
  const { isLoggedIn, userDetails } = useAuthContext();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !isLoggedIn) return;

    try {
      setSubmitting(true);
      
      await commentServiceCreateComment({
        body: {
          project_id: projectId,
          content: newComment.trim(),
          timeline_item_id: timelineItemId || null,
          parent_comment_id: null
        }
      });

      setNewComment("");
      onCommentAdded();
      
      toast({
        title: "Uspešno",
        description: "Komentar je dodat.",
      });

    } catch (error) {
      console.error("Error creating comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyText.trim() || !isLoggedIn) return;

    try {
      await commentServiceCreateComment({
        body: {
          project_id: projectId,
          content: replyText.trim(),
          timeline_item_id: timelineItemId || null,
          parent_comment_id: parentCommentId
        }
      });

      setReplyText("");
      setReplyingTo(null);
      onCommentAdded();
      
      toast({
        title: "Uspešno",
        description: "Odgovor je dodat.",
      });

    } catch (error) {
      console.error("Error creating reply:", error);
      toast({
        title: "Error",
        description: "Failed to add reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUserInitials = (userId: string) => {
    // This is a simplified approach - in a real app you'd fetch user details
    return userId.charAt(0).toUpperCase();
  };

  // Group comments by parent/child relationship
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);
  const getChildComments = (parentId: string) => 
    comments.filter(comment => comment.parent_comment_id === parentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Komentari ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment Form */}
        {isLoggedIn ? (
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="Napišite komentar..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!newComment.trim() || submitting}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Šalje se..." : "Pošalji komentar"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Prijavite se da biste ostavili komentar</p>
          </div>
        )}

        {/* Comments List */}
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>Nema komentara. Budite prvi koji će komentarisati!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topLevelComments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* Parent Comment */}
                <div className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-sm">
                      {getUserInitials(comment.user_id)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          Korisnik {comment.user_id.slice(-8)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at!).toLocaleDateString('sr-RS')}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                    
                    {/* Reply Button */}
                    {isLoggedIn && (
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(
                            replyingTo === comment.id ? null : comment.id!
                          )}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Reply className="h-3 w-3" />
                          Odgovori
                        </Button>
                      </div>
                    )}

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 ml-4 space-y-2">
                        <Textarea
                          placeholder="Napišite odgovor..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={2}
                          className="resize-none text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSubmitReply(comment.id!)}
                            disabled={!replyText.trim()}
                          >
                            Pošalji
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyText("");
                            }}
                          >
                            Otkaži
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Child Comments (Replies) */}
                {getChildComments(comment.id!).map((reply) => (
                  <div key={reply.id} className="ml-12 flex items-start space-x-3">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="text-xs">
                        {getUserInitials(reply.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Korisnik {reply.user_id.slice(-8)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(reply.created_at!).toLocaleDateString('sr-RS')}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap text-sm">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}