export default function MCQOption({ option, selected, correct, onClick }: { option: string; selected: boolean; correct?: boolean; onClick: () => void }) {
  const base = 'px-4 py-2 rounded-lg border cursor-pointer transition'
  const selectedCls = selected ? 'bg-[#607afb] text-white border-transparent' : 'bg-white text-[#0f172a] border-[#e9eaf2]'
  const correctnessCls = correct === true ? 'bg-[#ecfdf5] border-[#10b981] text-[#065f46]' : correct === false ? 'bg-[#fff1f2] border-[#fecaca] text-[#991b1b]' : ''

  return (
    <div
      className={`${base} ${selected ? selectedCls : ''} ${correct !== undefined ? correctnessCls : ''}`}
      onClick={onClick}
    >
      {option}
    </div>
  )
}
