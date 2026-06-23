export default function SubjectiveInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <textarea
      className="w-full rounded-lg border border-[#e9eaf2] p-3 min-h-[120px] resize-vertical"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    />
  )
}
