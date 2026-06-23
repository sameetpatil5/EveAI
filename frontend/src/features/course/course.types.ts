export interface LessonMeta {
  id: string
  title: string
  lesson_order: number
  generation_status: string
  completed: boolean
}

export interface Module {
  id: string
  title: string
  description?: string
  module_order: number
  is_locked: boolean
  lessons: LessonMeta[]
}

export interface CourseStructure {
  id: string
  title: string
  description?: string
  total_modules: number
  generation_status: string
  modules: Module[]
}
