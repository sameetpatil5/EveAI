export interface SubjectProgress {
  subject_id: string
  subject_name: string
  progress_percentage: number
}

export interface DashboardInsights {
  current_streak: number
  longest_streak: number
  today_lessons_completed: number
  today_lessons_total: number
  total_study_hours: number
  avg_quiz_score: number
  quiz_completion_rate: number
  subject_progress: SubjectProgress[]
  weekly_study_hours: Array<{ date: string; hours: number }>
}

export interface AIInsights {
  insights: string[]
  generated_at: string
}
