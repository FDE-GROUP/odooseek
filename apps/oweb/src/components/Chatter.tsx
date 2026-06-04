import { callKw, searchRead } from '@odooseek/odoo-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import { useState } from 'react'
import { useAuth } from '../lib/auth'

interface ChatterProps {
  model: string
  recordId: number | undefined
}

// mail.message has virtual fields (is_note, author_id, subtype_id) not in fields_get.
interface OdooMessage {
  id: number
  body: string
  author_id: [number, string] | false
  date: string
  message_type: string
  subtype_id: [number, string] | false
  is_note: boolean
}

interface OdooFollower {
  id: number
  partner_id: [number, string] | false
  channel_id: [number, string] | false
}

const MSG_FIELDS = ['id', 'body', 'author_id', 'date', 'message_type', 'subtype_id', 'is_note']
const FOLLOWER_FIELDS = ['id', 'partner_id', 'channel_id']

type ComposeMode = 'idle' | 'comment' | 'note'

export function Chatter({ model, recordId }: ChatterProps) {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const [composeMode, setComposeMode] = useState<ComposeMode>('idle')
  const [composeBody, setComposeBody] = useState('')

  const enabled = !!recordId

  const { data: messages, isLoading } = useQuery({
    queryKey: ['odoo', 'messages', model, recordId],
    queryFn: () =>
      searchRead<OdooMessage[]>(
        'mail.message',
        [
          ['model', '=', model],
          ['res_id', '=', recordId as number],
        ],
        MSG_FIELDS,
        0,
        30,
        'date desc',
      ),
    enabled,
    staleTime: 10_000,
  })

  const { data: followers } = useQuery({
    queryKey: ['odoo', 'followers', model, recordId],
    queryFn: () =>
      searchRead<OdooFollower[]>(
        'mail.followers',
        [
          ['res_model', '=', model],
          ['res_id', '=', recordId as number],
        ],
        FOLLOWER_FIELDS,
      ),
    enabled,
    staleTime: 30_000,
  })

  const invalidateChatter = () => {
    queryClient.invalidateQueries({ queryKey: ['odoo', 'messages', model, recordId] })
    queryClient.invalidateQueries({ queryKey: ['odoo', 'followers', model, recordId] })
  }

  const sendMutation = useMutation({
    mutationFn: ({ subtype }: { subtype: string }) =>
      callKw(model, 'message_post', [[recordId as number]], {
        body: composeBody,
        message_type: 'comment',
        subtype_xmlid: subtype,
      }),
    onSuccess: () => {
      setComposeMode('idle')
      setComposeBody('')
      invalidateChatter()
    },
  })

  const followMutation = useMutation({
    mutationFn: () =>
      callKw(model, 'message_subscribe', [[recordId as number]], {
        partner_ids: [session.partner_id],
        subtype_ids: false,
      }),
    onSuccess: invalidateChatter,
  })

  const unfollowMutation = useMutation({
    mutationFn: () =>
      callKw(model, 'message_unsubscribe', [[recordId as number]], {
        partner_ids: [session.partner_id],
      }),
    onSuccess: invalidateChatter,
  })

  if (!enabled) return null

  const followerCount = followers?.length ?? 0
  const isFollowing =
    followers?.some((f) => Array.isArray(f.partner_id) && f.partner_id[0] === session.partner_id) ??
    false

  return (
    <div className="border-t border-border-subtle px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-text-primary">
            Messages ({messages?.length ?? 0})
          </h4>
          <span className="text-[10px] text-text-muted">
            {followerCount} follower{followerCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isFollowing ? (
            <button
              type="button"
              onClick={() => unfollowMutation.mutate()}
              disabled={unfollowMutation.isPending}
              className="rounded px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-hover"
            >
              {unfollowMutation.isPending ? '...' : 'Unfollow'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
              className="rounded px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/10"
            >
              {followMutation.isPending ? '...' : 'Follow'}
            </button>
          )}
          {composeMode === 'idle' && (
            <>
              <button
                type="button"
                onClick={() => setComposeMode('comment')}
                className="rounded px-2 py-0.5 text-[11px] font-medium text-accent hover:bg-accent/10"
              >
                Send Message
              </button>
              <button
                type="button"
                onClick={() => setComposeMode('note')}
                className="rounded px-2 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-hover"
              >
                Log Note
              </button>
            </>
          )}
        </div>
      </div>

      {composeMode !== 'idle' && (
        <div className="mt-2 rounded-lg border border-border-subtle bg-surface/50 p-3">
          <div className="mb-2 text-xs font-medium text-text-secondary">
            {composeMode === 'comment' ? 'Send Message' : 'Log Note'}
          </div>
          <textarea
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            rows={3}
            className="w-full rounded border border-border-default bg-root px-2 py-1 text-xs text-text-primary focus:border-accent focus:outline-none"
            placeholder="Write something..."
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() =>
                sendMutation.mutate({
                  subtype: composeMode === 'comment' ? 'mail.mt_comment' : 'mail.mt_note',
                })
              }
              disabled={sendMutation.isPending || !composeBody.trim()}
              className="rounded bg-accent px-3 py-1 text-[11px] font-medium text-on-accent hover:bg-accent/90 disabled:opacity-50"
            >
              {sendMutation.isPending ? 'Sending...' : 'Send'}
            </button>
            <button
              type="button"
              onClick={() => {
                setComposeMode('idle')
                setComposeBody('')
              }}
              className="rounded border border-border-default px-3 py-1 text-[11px] text-text-secondary hover:bg-hover"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="py-4 text-center text-xs text-text-muted">Loading messages...</div>
      )}

      {!isLoading && (messages?.length ?? 0) === 0 && (
        <p className="py-3 text-center text-xs text-text-muted">No messages yet</p>
      )}

      {messages?.map((msg) => (
        <div
          key={msg.id}
          className="mt-2 rounded-lg border border-border-subtle bg-surface/30 px-3 py-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-primary">
                {Array.isArray(msg.author_id) ? msg.author_id[1] : 'Unknown'}
              </span>
              {msg.is_note && (
                <span className="rounded bg-hover px-1 py-0.5 text-[9px] text-text-muted">
                  Note
                </span>
              )}
            </div>
            <span className="text-[10px] text-text-muted">
              {msg.date ? new Date(msg.date.replace(' ', 'T')).toLocaleString() : ''}
            </span>
          </div>
          {msg.body && (
            <div
              className="prose prose-xs mt-1 max-w-none text-xs text-text-primary"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: DOMPurify sanitized message body
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(msg.body) }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
