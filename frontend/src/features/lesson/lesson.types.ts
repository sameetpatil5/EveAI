export interface Lesson {
  id: string
  title: string
  generation_status: string
  content?: string
  summary?: string
  hobby_explanation?: string
  references?: string[]
  youtube_links?: string[]
  completed: boolean
}
