import { useSyncExternalStore } from 'react'

// The store never changes, so nothing ever needs to be notified.
const subscribe = () => () => {}
const onClient = () => true
const onServer = () => false

/** Whether the component has hydrated on the client.
 *
 *  Used to defer rendering anything whose correct output is only knowable in the
 *  browser — the resolved colour theme, for instance — so the server and the first
 *  client render agree and hydration does not mismatch.
 *
 *  `useSyncExternalStore` rather than `useState` + `useEffect(() => setMounted(true))`:
 *  the effect version sets state during the commit that just rendered, which
 *  triggers a second render pass for every component doing it, and is what
 *  react-hooks/set-state-in-effect flags. Here React takes the server snapshot
 *  (false) while hydrating and the client one (true) afterwards, which is exactly
 *  the same behaviour with none of the cascade. */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer)
}
