import { useState } from 'react'
import { Star, MessageCircle, ThumbsUp, Reply } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingButton } from '@/components/ui/loading-button'
import { useSocialFeatures } from '@/hooks/useSocialFeatures'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface SocialPanelProps {
  agentId: string
  agentName: string
}

export function SocialPanel({ agentId, agentName }: SocialPanelProps) {
  const {
    ratings,
    comments,
    averageRating,
    userRating,
    isLoading,
    submitRating,
    submitComment,
    likeComment
  } = useSocialFeatures(agentId)

  const [selectedRating, setSelectedRating] = useState(userRating?.rating || 0)
  const [review, setReview] = useState(userRating?.review || '')
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const handleRatingSubmit = async () => {
    if (selectedRating === 0) return

    setIsSubmittingRating(true)
    const success = await submitRating(selectedRating, review)
    if (success) {
      setReview('')
    }
    setIsSubmittingRating(false)
  }

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    const success = await submitComment(newComment.trim())
    if (success) {
      setNewComment('')
    }
    setIsSubmittingComment(false)
  }

  const handleReplySubmit = async () => {
    // For now, replies are treated as regular comments
    // In a full implementation, you'd handle parent_id
    if (!replyContent.trim()) return

    setIsSubmittingComment(true)
    const success = await submitComment(replyContent.trim())
    if (success) {
      setReplyContent('')
      setReplyTo(null)
    }
    setIsSubmittingComment(false)
  }

  const renderStars = (rating: number, interactive: boolean = false, onSelect?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4 transition-colors",
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
              interactive && "cursor-pointer hover:text-yellow-400"
            )}
            onClick={() => interactive && onSelect?.(star)}
          />
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-muted-foreground">
            {rating.toFixed(1)} {!interactive && `(${ratings.length} reviews)`}
          </span>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-muted/50 h-32 rounded-lg" />
        <div className="animate-pulse bg-muted/50 h-48 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Rating Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Rate {agentName}
          </CardTitle>
          <CardDescription>
            Share your experience with this AI agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Average Rating Display */}
          {ratings.length > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                  {renderStars(averageRating)}
                </div>
                <Badge variant="secondary">{ratings.length} reviews</Badge>
              </div>
            </div>
          )}

          {/* User Rating Input */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Rating</label>
              {renderStars(selectedRating, true, setSelectedRating)}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Review (Optional)</label>
              <Textarea
                placeholder="Share your thoughts about this agent..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={3}
              />
            </div>

            <LoadingButton
              onClick={handleRatingSubmit}
              loading={isSubmittingRating}
              disabled={selectedRating === 0}
              className="w-full"
            >
              {userRating ? 'Update Rating' : 'Submit Rating'}
            </LoadingButton>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Community Discussion ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Comment */}
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts about this agent..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <LoadingButton
              onClick={handleCommentSubmit}
              loading={isSubmittingComment}
              disabled={!newComment.trim()}
            >
              Post Comment
            </LoadingButton>
          </div>

          <Separator />

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.profile?.avatar_url} />
                    <AvatarFallback>
                      {comment.profile?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.profile?.display_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likeComment(comment.id)}
                        className="h-auto p-1 text-xs"
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {comment.likes_count || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setReplyTo(comment.id)}
                        className="h-auto p-1 text-xs"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    </div>

                    {/* Reply Form */}
                    {replyTo === comment.id && (
                      <div className="space-y-2 pl-4 border-l-2 border-border">
                        <Textarea
                          placeholder="Write a reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <LoadingButton
                            onClick={() => handleReplySubmit()}
                            loading={isSubmittingComment}
                            disabled={!replyContent.trim()}
                            size="sm"
                          >
                            Reply
                          </LoadingButton>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReplyTo(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Note: Replies functionality would be implemented here in a full version */}
                  </div>
                </div>
              </div>
            ))}

            {comments.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}