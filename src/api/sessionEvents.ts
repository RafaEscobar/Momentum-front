const unauthorizedEventName = 'momentum:unauthorized'

export function notifyUnauthorized() {
  window.dispatchEvent(new Event(unauthorizedEventName))
}

export function subscribeToUnauthorized(listener: () => void) {
  window.addEventListener(unauthorizedEventName, listener)

  return () => window.removeEventListener(unauthorizedEventName, listener)
}
