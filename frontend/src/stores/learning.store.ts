import { create } from 'zustand'

interface LearningState {
  activeCourseId: string | null
  activeLessonId: string | null
  tutorSessionId: string | null
  setActiveCourseId: (courseId: string | null) => void
  setActiveLessonId: (lessonId: string | null) => void
  setTutorSessionId: (sessionId: string | null) => void
  clearLearning: () => void
}

export const useLearningStore = create<LearningState>((set) => ({
  activeCourseId: null,
  activeLessonId: null,
  tutorSessionId: null,
  setActiveCourseId: (courseId) => set({ activeCourseId: courseId }),
  setActiveLessonId: (lessonId) => set({ activeLessonId: lessonId }),
  setTutorSessionId: (sessionId) => set({ tutorSessionId: sessionId }),
  clearLearning: () =>
    set({ activeCourseId: null, activeLessonId: null, tutorSessionId: null }),
}))
