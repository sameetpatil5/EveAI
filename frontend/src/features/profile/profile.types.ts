export interface SubjectProfileItem {
  id: string
  name: string
  priority: number
  weekly_hours: number
  goal?: string
}

export interface TimeSlot {
  start: string
  end: string
}

export interface Profile {
  user: { id: string; email: string }
  profile: {
    full_name: string
    academic_level: string
    major: string
    available_time_slots: TimeSlot[]
  }
  hobbies: string[]
  subjects: SubjectProfileItem[]
}
