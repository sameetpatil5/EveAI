export interface AcademicInfo {
  academic_level: string
  major: string
}

export interface SubjectInput {
  name: string
  level: string
  priority: number
  weekly_hours: number
  target_weeks: number
  goal?: string
}

export interface AvailabilitySlot {
  start: string
  end: string
}

export interface AvailabilityRequest {
  available_time_slots: AvailabilitySlot[]
}