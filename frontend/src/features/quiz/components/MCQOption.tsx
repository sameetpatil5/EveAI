export default function MCQOption({ option, selected, correct, onClick }: { option: string; selected: boolean; correct?: boolean; onClick: () => void }) {
  const base = 'px-4 py-3 rounded-2xl border cursor-pointer transition text-sm'
  const selectedCls = selected ? 'bg-[#607afb] text-white border-transparent shadow-sm' : 'bg-white text-slate-700 border-[#e9eaf2] hover:border-[#607afb] hover:bg-[#f8fbff]'
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
