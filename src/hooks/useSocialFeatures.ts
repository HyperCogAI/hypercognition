import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'

interface Rating {
  id: string
  user_id: string
  agent_id: string
  rating: number
  review?: string
  created_at: string
  profile?: {
    display_name?: string
    avatar_url?: string
  }
}

interface Comment {
  id: string
  user_id: string
  agent_id: string
  content: string
  likes_count: number
  created_at: string
  profile?: {
    display_name?: string
    avatar_url?: string
  }
}

export const useSocialFeatures = (agentId: string) => {
  const { user } = useAuth()
  const [ratings, setRatings] = useState<Rating[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [userRating, setUserRating] = useState<Rating | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate average rating
  const averageRating = ratings.length > 0 
    ? ratings.reduce((acc, rating) => acc + rating.rating, 0) / ratings.length 
    : 0

  // Fetch ratings and comments
  const fetchSocialData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch ratings with user profiles (simplified)
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('agent_ratings')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      if (ratingsError) throw ratingsError

      // Fetch comments (simplified)
      const { data: commentsData, error: commentsError } = await supabase
        .from('agent_comments')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      if (commentsError) throw commentsError

      setRatings((ratingsData || []) as Rating[])
      setComments((commentsData || []) as Comment[])

      // Find user's rating if logged in
      if (user && ratingsData) {
        const myRating = ratingsData.find(r => r.user_id === user.id)
        setUserRating((myRating || null) as Rating | null)
      }
    } catch (error) {
      console.error('Error fetching social data:', error)
      toast({
        title: "Error loading social data",
        description: "Please try again later",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Submit or update rating
  const submitRating = async (rating: number, review?: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please connect your wallet to rate agents",
        variant: "destructive"
      })
      return false
    }

    try {
      const ratingData = {
        user_id: user.id,
        agent_id: agentId,
        rating,
        review: review || null
      }

      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('agent_ratings')
          .update(ratingData)
          .eq('id', userRating.id)

        if (error) throw error
      } else {
        // Create new rating
        const { error } = await supabase
          .from('agent_ratings')
          .insert([ratingData])

        if (error) throw error
      }

      toast({
        title: "Rating submitted",
        description: "Thank you for your feedback!",
      })

      // Refresh data
      fetchSocialData()
      return true
    } catch (error) {
      console.error('Error submitting rating:', error)
      toast({
        title: "Failed to submit rating",
        description: "Please try again",
        variant: "destructive"
      })
      return false
    }
  }

  // Submit comment
  const submitComment = async (content: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please connect your wallet to comment",
        variant: "destructive"
      })
      return false
    }

    try {
      const { error } = await supabase
        .from('agent_comments')
        .insert([{
          user_id: user.id,
          agent_id: agentId,
          content
        }])

      if (error) throw error

      toast({
        title: "Comment posted",
        description: "Your comment has been added to the discussion",
      })

      // Refresh data
      fetchSocialData()
      return true
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast({
        title: "Failed to post comment",
        description: "Please try again",
        variant: "destructive"
      })
      return false
    }
  }

  // Like/unlike comment
  const likeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please connect your wallet to like comments",
        variant: "destructive"
      })
      return false
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('comment_id', commentId)
        .single()

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id)

        if (error) throw error

        // Decrease likes count
        const { data: currentComment } = await supabase
          .from('agent_comments')
          .select('likes_count')
          .eq('id', commentId)
          .single()

        if (currentComment) {
          const { error: updateError } = await supabase
            .from('agent_comments')
            .update({ likes_count: Math.max(0, currentComment.likes_count - 1) })
            .eq('id', commentId)

          if (updateError) throw updateError
        }
      } else {
        // Like
        const { error } = await supabase
          .from('comment_likes')
          .insert([{
            user_id: user.id,
            comment_id: commentId
          }])

        if (error) throw error

        // Increase likes count
        const { data: currentComment } = await supabase
          .from('agent_comments')
          .select('likes_count')
          .eq('id', commentId)
          .single()

        if (currentComment) {
          const { error: updateError } = await supabase
            .from('agent_comments')
            .update({ likes_count: currentComment.likes_count + 1 })
            .eq('id', commentId)

          if (updateError) throw updateError
        }
      }

      // Refresh data
      fetchSocialData()
      return true
    } catch (error) {
      console.error('Error liking comment:', error)
      toast({
        title: "Failed to update like",
        description: "Please try again",
        variant: "destructive"
      })
      return false
    }
  }

  useEffect(() => {
    fetchSocialData()
  }, [agentId, user])

  // Subscribe to real-time updates
  useEffect(() => {
    const ratingsChannel = supabase
      .channel('agent-ratings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_ratings',
          filter: `agent_id=eq.${agentId}`
        },
        () => fetchSocialData()
      )
      .subscribe()

    const commentsChannel = supabase
      .channel('agent-comments')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_comments',
          filter: `agent_id=eq.${agentId}`
        },
        () => fetchSocialData()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(ratingsChannel)
      supabase.removeChannel(commentsChannel)
    }
  }, [agentId])

  return {
    ratings,
    comments,
    userRating,
    averageRating,
    isLoading,
    submitRating,
    submitComment,
    likeComment,
    fetchSocialData
  }
}