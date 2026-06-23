export interface DashboardStats {
  current_streak: number
  longest_streak: number
  today_lessons_count: number
  avg_quiz_score: number
  completion_rate: number
}

export interface SubjectSummary {
  id: string
  name: string
  level: string
  priority: number
  progress_percentage: number
}

export interface ScheduleEntry {
  id: string
  time: string
  title: string
  activity_type: string
  related_lesson_id: string | null
}

export interface DashboardState {
  user: { id: string; email: string }
  profile: { full_name: string; academic_level: string; major: string }
  hobbies: string[]
  subjects: SubjectSummary[]
  upcoming_schedule: ScheduleEntry[]
  stats: DashboardStats
  last_active_lesson_id: string | null
}
