import { useState } from 'react'
import { getUserInitials } from '../../utils/userAvatar.js'

const SIZE_CLASSES = {
  sm: 'h-6 w-6 text-[0.65rem]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
}

/**
 * @param {{
 *   name: string
 *   size?: 'sm' | 'md' | 'lg'
 *   className?: string
 * }} props
 */
function InitialsAvatar({ name, size = 'md', className = '' }) {
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-neutral font-semibold text-primary ${sizeClass} ${className}`}
    >
      {getUserInitials(name)}
    </span>
  )
}

/**
 * @param {{
 *   url: string
 *   name: string
 *   size?: 'sm' | 'md' | 'lg'
 *   className?: string
 * }} props
 */
function AvatarImage({ url, name, size = 'md', className = '' }) {
  const [imageFailed, setImageFailed] = useState(false)
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

  if (imageFailed) {
    return <InitialsAvatar name={name} size={size} className={className} />
  }

  return (
    <img
      src={url}
      alt=""
      className={`shrink-0 rounded-full object-cover ${sizeClass} ${className}`}
      loading="lazy"
      onError={() => setImageFailed(true)}
    />
  )
}

/**
 * @param {{
 *   user?: import('../../types/index.js').User | null
 *   name?: string
 *   avatarUrl?: string | null
 *   size?: 'sm' | 'md' | 'lg'
 *   className?: string
 * }} props
 */
export function UserAvatar({ user, name, avatarUrl, size = 'md', className = '' }) {
  const displayName = name ?? user?.name ?? ''
  const resolvedAvatarUrl = avatarUrl ?? user?.avatarUrl ?? null

  if (!resolvedAvatarUrl) {
    return <InitialsAvatar name={displayName} size={size} className={className} />
  }

  return (
    <AvatarImage
      key={resolvedAvatarUrl}
      url={resolvedAvatarUrl}
      name={displayName}
      size={size}
      className={className}
    />
  )
}
