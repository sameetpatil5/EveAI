import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { useRegenerateScheduleMutation } from '../schedule.queries'
import { Button } from '@/components/ui/Button'

export default function RegenerateScheduleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [feedback, setFeedback] = useState('')
  const mut = useRegenerateScheduleMutation()

  const handleSubmit = () => {
    mut.mutate(feedback, { onSuccess: () => onClose() })
  }

  return (
    <Modal open={open} onClose={onClose} title="Regenerate Schedule">
      <div className="space-y-4">
        <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} className="w-full rounded-lg border border-[#e9eaf2] p-3 min-h-[120px]" />
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} className="ml-2" disabled={mut.status === 'pending'}>{mut.status === 'pending' ? 'Regenerating…' : 'Regenerate'}</Button>
        </div>
      </div>
    </Modal>
  )
}
