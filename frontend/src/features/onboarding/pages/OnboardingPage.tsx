import { useState } from 'react'
import OnboardingProgress from '../components/OnboardingProgress'
import StepAcademic from '../components/StepAcademic'
import StepSubjects from '../components/StepSubjects'
import StepHobbies from '../components/StepHobbies'
import StepAvailability from '../components/StepAvailability'
import StepFinish from '../components/StepFinish'

const steps = [
  { id: 1, component: StepAcademic },
  { id: 2, component: StepSubjects },
  { id: 3, component: StepHobbies },
  { id: 4, component: StepAvailability },
  { id: 5, component: StepFinish },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const StepComponent =
    steps.find((item) => item.id === step)?.component ?? StepAcademic

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f9fc] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1">
        <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-[32px] border border-[#e9eaf2] bg-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)]">
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">
            <div className="mb-8 space-y-2">
              <div className="flex justify-center">
                <div className="inline-flex rounded-full border border-[#dbe4ff] bg-[#eef2ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#607afb]">
                  Personalize your study plan
                </div>
              </div>

              <h1 className="text-2xl font-semibold text-[#0f172a]">
                Tell us a little about you
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-[#64748b]">
                These steps help EveAI tailor lessons, schedules, and study
                recommendations to your goals.
              </p>
            </div>

            <OnboardingProgress currentStep={step} totalSteps={5} />

            <div className="mt-8">
              <StepComponent
                onNext={() => setStep((current) => Math.min(current + 1, 5))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
