export interface SubjectProfileItem {
  id: string
  name: string
  priority: number
  weekly_hours: number
  goal?: string
  progress_percentage: number
}

export interface TimeSlot {
  start: string
  end: string
}

export interface Profile {
  user: { id: string; email: string; member_since: string }
  profile: {
    full_name: string
    academic_level: string
    major: string
    available_time_slots: TimeSlot[]
  }
  hobbies: string[]
  current_streak: number
  total_lessons_completed: number
  subjects: SubjectProfileItem[]
}
