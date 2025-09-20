import { useState } from 'react'
import { Star, MessageCircle, Heart, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSocialFeatures } from '@/hooks/useSocialFeatures'
import { useAuth } from '@/contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { LoadingButton } from '@/components/ui/loading-button'

interface AgentSocialPanelProps {
  agentId: string
  agentName: string
}

export function AgentSocialPanel({ agentId, agentName }: AgentSocialPanelProps) {
  const { user } = useAuth()
  const { 
    ratings, 
    comments, 
    averageRating, 
    userRating,
    submitRating, 
    submitComment, 
    likeComment,
    isLoading 
  } = useSocialFeatures(agentId)
  
  const [selectedRating, setSelectedRating] = useState(userRating?.rating || 0)
  const [review, setReview] = useState(userRating?.review || '')
  const [newComment, setNewComment] = useState('')
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  const handleSubmitRating = async () => {
    if (!selectedRating) return
    
    setIsSubmittingRating(true)
    const success = await submitRating(selectedRating, review)
    if (success) {
      setReview('')
    }
    setIsSubmittingRating(false)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    
    setIsSubmittingComment(true)
    const success = await submitComment(newComment)
    if (success) {
      setNewComment('')
    }
    setIsSubmittingComment(false)
  }

  const renderStars = (rating: number, interactive = false, size = 'h-4 w-4') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} cursor-pointer transition-colors ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
        onClick={interactive ? () => setSelectedRating(i + 1) : undefined}
      />
    ))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Community
        </CardTitle>
        <CardDescription>
          Ratings, reviews, and discussions about {agentName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Rating Summary */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center">
                  {renderStars(Math.round(averageRating))}
                </div>
                <div className="text-sm text-muted-foreground">
                  {ratings.length} review{ratings.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.filter(r => r.rating === star).length
                  const percentage = ratings.length > 0 ? (count / ratings.length) * 100 : 0
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span>{star}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent Comments Preview */}
            <div>
              <h4 className="font-medium mb-3">Recent Comments</h4>
              <div className="space-y-3">
                {comments.slice(0, 3).map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 bg-muted/20 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profile?.avatar_url} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {comment.profile?.display_name || 'Anonymous'}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {comment.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {/* Submit Rating */}
            {user && (
              <div className="p-4 border rounded-lg space-y-4">
                <h4 className="font-medium">Rate this Agent</h4>
                <div className="flex items-center gap-2">
                  {renderStars(selectedRating, true, 'h-6 w-6')}
                  <span className="text-sm text-muted-foreground ml-2">
                    {selectedRating > 0 ? `${selectedRating} star${selectedRating !== 1 ? 's' : ''}` : 'Click to rate'}
                  </span>
                </div>
                <Textarea
                  placeholder="Write a review (optional)..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={3}
                />
                <LoadingButton
                  onClick={handleSubmitRating}
                  loading={isSubmittingRating}
                  disabled={!selectedRating}
                  size="sm"
                >
                  {userRating ? 'Update Rating' : 'Submit Rating'}
                </LoadingButton>
              </div>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
              {ratings.filter(r => r.review).map((rating) => (
                <div key={rating.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={rating.profile?.avatar_url} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {rating.profile?.display_name || 'Anonymous'}
                        </span>
                        <div className="flex">
                          {renderStars(rating.rating)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm">{rating.review}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            {/* Submit Comment */}
            {user && (
              <div className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">Join the Discussion</h4>
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <LoadingButton
                  onClick={handleSubmitComment}
                  loading={isSubmittingComment}
                  disabled={!newComment.trim()}
                  size="sm"
                >
                  Post Comment
                </LoadingButton>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={comment.profile?.avatar_url} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">
                          {comment.profile?.display_name || 'Anonymous'}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likeComment(comment.id)}
                          className="h-auto p-1"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          {comment.likes_count}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}