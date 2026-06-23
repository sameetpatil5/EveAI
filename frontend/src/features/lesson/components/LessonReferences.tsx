interface LessonReferencesProps {
  references?: string[]
  youtubeLinks?: string[]
}

export function LessonReferences({ references, youtubeLinks }: LessonReferencesProps) {
  if ((!references || references.length === 0) && (!youtubeLinks || youtubeLinks.length === 0)) return null

  return (
    <div className="mt-6 rounded-2xl border border-[#e9eaf2] bg-white p-5">
      <div className="text-sm font-medium text-[#475569]">Resources</div>
      <div className="mt-3 space-y-2 text-sm text-[#0f172a]">
        {references?.map((r) => (
          <div key={r}><a className="text-[#2563eb] underline" href={r} target="_blank" rel="noreferrer">{r}</a></div>
        ))}
        {youtubeLinks?.map((y) => (
          <div key={y}><a className="text-[#2563eb] underline" href={y} target="_blank" rel="noreferrer">{y}</a></div>
        ))}
      </div>
    </div>
  )
}
