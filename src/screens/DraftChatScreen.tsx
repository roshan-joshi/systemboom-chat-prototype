import { useState } from 'react'
import { MessageSquare, Lock } from 'lucide-react'
import { useRouter, useParams } from '@/lib/router'
import {
  TopAppBar,
  Avatar,
  Icon,
  MessageComposer,
  useToast,
} from '@/components'
import { useStore, useUser } from '@/data/store'
import { useOnline } from '@/lib/connectivity'
import type { PrivacyMode } from '@/data/types'

/*
  Pre-creation state of a Direct Chat (FLOW-003, PD-063/PD-065/PD-058).
  Contact is already chosen; the user picks Standard (default) or Private before
  the first message. Sending the first message creates the conversation and
  locks its mode permanently. No blocking dialogs, no crypto jargon.
*/
export function DraftChatScreen() {
  const { navigate, back, query } = useRouter()
  const { userId } = useParams('/draft-chat/:userId')
  const user = useUser(userId)
  const store = useStore()
  const toast = useToast()
  const online = useOnline()

  const preset = query.get('mode') === 'private' ? 'private' : 'standard'
  const [mode, setMode] = useState<PrivacyMode>(preset)
  const [draft, setDraft] = useState('')

  if (!user) {
    return (
      <div className="sb-fill">
        <TopAppBar title="New chat" onBack={back} />
        <div className="sb-center">Contact not found.</div>
      </div>
    )
  }

  const send = () => {
    const text = draft.trim()
    if (!text) return
    // Creates the conversation in the chosen mode — or routes into the existing
    // one for this pair + mode (PD-064): never a duplicate.
    const id = store.openOrCreatePrivate(user.id, mode)
    store.sendMessage(id, { type: 'text', text }, online)
    navigate(`/chats/${id}`, { replace: true })
  }

  const OPTIONS: {
    value: PrivacyMode
    label: string
    desc: string
    icon: typeof MessageSquare
  }[] = [
    { value: 'standard', label: 'Standard', desc: 'Secured in transit and at rest', icon: MessageSquare },
    { value: 'private', label: 'Private', desc: 'End-to-end encrypted — only participants’ devices can read it', icon: Lock },
  ]

  return (
    <div className="sb-fill">
      <TopAppBar
        titleContent={
          <div className="sb-chathead" style={{ cursor: 'default' }}>
            <Avatar name={user.name} kind={user.business ? 'business' : 'user'} size="md" presence={user.presence} />
            <span className="sb-chathead__body">
              <span className="sb-chathead__name">{user.name}</span>
              <span className="sb-chathead__status">New conversation</span>
            </span>
          </div>
        }
        onBack={back}
      />

      <div className="sb-shell__main" data-scroll-region data-fill="true">
        <div className="sb-center">
          <div style={{ width: '100%', maxWidth: 420, padding: '0 var(--sb-space-4)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--sb-space-5)' }}>
              <Avatar name={user.name} kind={user.business ? 'business' : 'user'} size="xl" />
              <p style={{ marginTop: 10, fontWeight: 700 }}>{user.name}</p>
              <p style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-secondary)' }}>
                Choose how this conversation is protected, then say hello.
              </p>
            </div>

            <div className="sb-col sb-gap-2" role="radiogroup" aria-label="Conversation privacy">
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className="sb-paymethod"
                  role="radio"
                  aria-checked={mode === o.value}
                  aria-pressed={mode === o.value}
                  onClick={() => setMode(o.value)}
                >
                  <span
                    className="sb-paymethod__icon"
                    style={{ background: o.value === 'private' ? 'var(--sb-info)' : 'var(--sb-text-tertiary)' }}
                  >
                    <Icon as={o.icon} size="sm" />
                  </span>
                  <span className="sb-grow">
                    <span style={{ display: 'block', fontWeight: 600 }}>
                      {o.label}
                      {o.value === 'standard' && (
                        <span style={{ fontWeight: 500, color: 'var(--sb-text-tertiary)', fontSize: 'var(--sb-text-label)' }}> · default</span>
                      )}
                    </span>
                    <span style={{ fontSize: 'var(--sb-text-caption)', color: 'var(--sb-text-tertiary)' }}>{o.desc}</span>
                  </span>
                  <span className="sb-paymethod__radio" />
                </button>
              ))}
            </div>

            <p
              style={{
                textAlign: 'center',
                fontSize: 'var(--sb-text-label)',
                color: 'var(--sb-text-tertiary)',
                marginTop: 'var(--sb-space-3)',
              }}
            >
              Privacy type can’t be changed after this conversation starts.
            </p>
          </div>
        </div>
      </div>

      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSend={send}
        onAttach={() => toast.show('Send your first message to start the conversation')}
        onEmoji={() => setDraft((d) => d + '🙂')}
        placeholder={mode === 'private' ? 'Private message' : 'Message'}
      />
    </div>
  )
}
