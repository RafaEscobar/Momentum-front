import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const PROJECT_PATH_PATTERN = /^\/projects\/(\d+)(?:\/|$)/
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]'

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest(EDITABLE_SELECTOR))
}

export function useAppShortcuts() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        isEditableTarget(event.target) ||
        document.querySelector('[aria-modal="true"]')
      ) {
        return
      }

      const key = event.key.toLowerCase()

      if (key === 'd') {
        event.preventDefault()
        void navigate('/dashboard')
        return
      }

      const projectId = pathname.match(PROJECT_PATH_PATTERN)?.[1]

      if (!projectId) {
        return
      }

      if (key === 'b') {
        event.preventDefault()
        void navigate(`/projects/${projectId}/backlog`)
      }

      if (key === 'n') {
        event.preventDefault()
        void navigate(`/projects/${projectId}/backlog?create=task`)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, pathname])
}
