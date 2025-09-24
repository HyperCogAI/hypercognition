import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface TutorialStep {
  id: string
  title: string
  description: string
  content: string
  action?: string
  targetSelector?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

interface Tutorial {
  id: string
  title: string
  description: string
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration: string
  icon: string
  steps: TutorialStep[]
  is_active: boolean
}

interface TutorialProgress {
  tutorial_id: string
  step_id: string
  completed: boolean
  completed_at?: string
}

export const useTutorialProgress = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [userProgress, setUserProgress] = useState<TutorialProgress[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchTutorials = async () => {
    try {
      const { data, error } = await supabase
        .from('tutorials')
        .select('*')
        .eq('is_active', true)
        .order('created_at')

      if (error) throw error
      setTutorials((data || []).map(t => ({
        ...t,
        difficulty: t.difficulty as 'beginner' | 'intermediate' | 'advanced',
        steps: Array.isArray(t.steps) ? t.steps as unknown as TutorialStep[] : [],
        description: t.description || '',
        duration: t.duration || '',
        icon: t.icon || 'Book'
      })))
    } catch (error) {
      console.error('Failed to fetch tutorials:', error)
      toast({
        title: "Error loading tutorials",
        description: "Please try again later",
        variant: "destructive"
      })
    }
  }

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setUserProgress(data || [])
    } catch (error) {
      console.error('Failed to fetch user progress:', error)
    }
  }

  const markStepCompleted = async (tutorialId: string, stepId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to track progress",
          variant: "destructive"
        })
        return false
      }

      const { error } = await supabase
        .from('tutorial_progress')
        .upsert({
          user_id: user.id,
          tutorial_id: tutorialId,
          step_id: stepId,
          completed: true,
          completed_at: new Date().toISOString()
        })

      if (error) throw error

      setUserProgress(prev => {
        const filtered = prev.filter(p => !(p.tutorial_id === tutorialId && p.step_id === stepId))
        return [...filtered, { tutorial_id: tutorialId, step_id: stepId, completed: true, completed_at: new Date().toISOString() }]
      })

      return true
    } catch (error) {
      console.error('Failed to mark step as completed:', error)
      toast({
        title: "Error saving progress",
        description: "Please try again",
        variant: "destructive"
      })
      return false
    }
  }

  const getTutorialProgress = (tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId)
    if (!tutorial) return { completed: 0, total: 0, percentage: 0 }

    const completed = userProgress.filter(p => 
      p.tutorial_id === tutorialId && p.completed
    ).length

    const total = tutorial.steps.length
    const percentage = total > 0 ? (completed / total) * 100 : 0

    return { completed, total, percentage }
  }

  const isTutorialCompleted = (tutorialId: string) => {
    const progress = getTutorialProgress(tutorialId)
    return progress.percentage === 100
  }

  const isStepCompleted = (tutorialId: string, stepId: string) => {
    return userProgress.some(p => 
      p.tutorial_id === tutorialId && 
      p.step_id === stepId && 
      p.completed
    )
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchTutorials(), fetchUserProgress()])
      setLoading(false)
    }
    
    loadData()
  }, [])

  return {
    tutorials,
    userProgress,
    loading,
    markStepCompleted,
    getTutorialProgress,
    isTutorialCompleted,
    isStepCompleted,
    refetch: () => Promise.all([fetchTutorials(), fetchUserProgress()])
  }
}