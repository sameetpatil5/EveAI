export interface ScheduleEntry {
  id: string
  title: string
  start_time: string
  end_time: string
  activity_type: string
  status: string
  related_subject_id?: string
  related_lesson_id?: string
  related_quiz_id?: string
}

export interface ScheduleResponse {
  entries: ScheduleEntry[]
}
