export default function OnboardingProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="rounded-2xl bg-white p-4">
      <div className="text-sm text-[#475569]">Step {currentStep} of {totalSteps}</div>
      <div className="mt-2 h-2 w-full rounded-full bg-[#e9eaf2]"><div className="h-2 rounded-full bg-[#607afb]" style={{ width: `${(currentStep / totalSteps) * 100}%` }} /></div>
    </div>
  )
}
