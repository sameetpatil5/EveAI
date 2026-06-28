export default function OnboardingProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const progressPercent = Math.round((currentStep / totalSteps) * 100)

  return (
    <div className="rounded-[24px] border border-[#e9eaf2] bg-[#f8fafc] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#0f172a]">Step {currentStep} of {totalSteps}</p>
          <p className="mt-1 text-sm text-[#64748b]">We’ll personalize the experience as you move through these steps.</p>
        </div>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#607afb]">{progressPercent}%</div>
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-[#e9eaf2]">
        <div className="h-2 rounded-full bg-[#607afb]" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}
