export interface SubjectProgress {
  subject_id: string
  subject_name: string
  progress_percentage: number
}

export interface Insights {
  current_streak: number
  longest_streak: number
  today_lessons_completed: number
  today_lessons_total: number
  total_study_hours: number
  total_estimated_study_hours: number
  total_study_hours_this_week: number
  total_study_hours_available_this_week: number
  total_course_completion: number
  total_lessons_completed: number
  total_lessons_available: number
  last_active_lesson_id: string | null
  avg_quiz_score: number
  quiz_completion_rate: number
  subject_progress: SubjectProgress[]
  weekly_study_hours: Array<{ date: string; hours: number }>
}

export interface AIInsights {
  insights: string[]
  generated_at: string
}
