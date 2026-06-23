export interface Subject {
  id: string
  name: string
  level: string
  priority: number
  weekly_hours: number
  target_weeks: number
  goal?: string
  status: string
  progress_percentage: number
  course_id?: string | null
  course_generation_status?: string | null
}

export interface SubjectCreate {
  name: string
  level: string
  priority: number
  weekly_hours: number
  target_weeks: number
  goal?: string
}

export interface SubjectUpdate extends Partial<SubjectCreate> {}
