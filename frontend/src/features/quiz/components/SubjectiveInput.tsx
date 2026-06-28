export default function SubjectiveInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <textarea
      className="min-h-[120px] w-full resize-vertical rounded-2xl border border-[#dbe4ff] bg-white p-3 text-sm text-slate-700 outline-none transition focus:border-[#607afb] focus:ring-2 focus:ring-[#dbe4ff] disabled:cursor-not-allowed disabled:opacity-70"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Type your answer here..."
    />
  )
}
