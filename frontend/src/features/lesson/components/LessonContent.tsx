import ReactMarkdown from 'react-markdown'
import type { Lesson } from '../lesson.types'
import { LessonHeader } from './LessonHeader'
import { LessonReferences } from './LessonReferences'

interface LessonContentProps {
  lesson: Lesson
}

export function LessonContent({ lesson }: LessonContentProps) {
  return (
    <article>
      <LessonHeader title={lesson.title} completed={lesson.completed} />

      {lesson.content ? (
        <div className="prose max-w-none text-sm text-[#0f172a]"><ReactMarkdown>{lesson.content}</ReactMarkdown></div>
      ) : null}

      {lesson.hobby_explanation ? (
        <div className="mt-6 rounded-2xl border border-[#e9eaf2] bg-white p-5">
          <div className="text-sm font-medium text-[#475569]">How it relates to your interests</div>
          <div className="mt-2 text-sm text-[#0f172a]">{lesson.hobby_explanation}</div>
        </div>
      ) : null}

      {lesson.summary ? (
        <div className="mt-6 rounded-2xl border border-[#e9eaf2] bg-white p-5">
          <div className="text-sm font-medium text-[#475569]">Summary</div>
          <div className="mt-2 text-sm text-[#0f172a]">{lesson.summary}</div>
        </div>
      ) : null}

      <LessonReferences references={lesson.references} youtubeLinks={lesson.youtube_links} />
    </article>
  )
}
