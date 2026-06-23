import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  tutorPanelOpen: boolean
  onboardingJobId: string | null
  activeOnboardingStep: number
  setOnboardingJobId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setTutorPanelOpen: (open: boolean) => void
  setActiveOnboardingStep: (step: number) => void
}

const ONBOARDING_JOB_KEY = 'eveai_onboardingJobId'

const initialOnboardingJobId =
  typeof window !== 'undefined'
    ? localStorage.getItem(ONBOARDING_JOB_KEY)
    : null

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  tutorPanelOpen: true,
  onboardingJobId: initialOnboardingJobId,
  activeOnboardingStep: 1,
  setOnboardingJobId: (id) => {
    if (typeof window !== 'undefined') {
      if (id) {
        localStorage.setItem(ONBOARDING_JOB_KEY, id)
      } else {
        localStorage.removeItem(ONBOARDING_JOB_KEY)
      }
    }
    set({ onboardingJobId: id })
  },
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTutorPanelOpen: (open) => set({ tutorPanelOpen: open }),
  setActiveOnboardingStep: (step) => set({ activeOnboardingStep: step }),
}))
