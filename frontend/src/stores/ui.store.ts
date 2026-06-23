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

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  tutorPanelOpen: true,
  onboardingJobId: null,
  activeOnboardingStep: 1,
  setOnboardingJobId: (id) => set({ onboardingJobId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTutorPanelOpen: (open) => set({ tutorPanelOpen: open }),
  setActiveOnboardingStep: (step) => set({ activeOnboardingStep: step }),
}))
