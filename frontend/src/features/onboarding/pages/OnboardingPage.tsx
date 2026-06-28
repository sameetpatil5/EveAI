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
  const StepComponent = steps.find((item) => item.id === step)?.component ?? StepAcademic

  return (
    <div className="min-h-screen bg-[#f8f9fc] px-4 py-2">
      <div className="mx-auto w-full max-w-3xl">
        <div className="space-y-4 rounded-[2rem] border border-[#e9eaf2] bg-white p-6 shadow-sm">
          <OnboardingProgress currentStep={step} totalSteps={5} />
          <div className="mt-4">
            <StepComponent onNext={() => setStep((current) => Math.min(current + 1, 5))} />
          </div>
        </div>
      </div>
    </div>
  )
}
