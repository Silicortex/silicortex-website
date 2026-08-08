'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions.ts'

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="password" className="text-sm font-medium">
        Passwort
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="rounded border border-gray-300 bg-white px-3 py-2"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-[#1f5f4f] px-3 py-2 font-medium text-white disabled:opacity-60"
      >
        {pending ? 'Prüfe …' : 'Anmelden'}
      </button>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
    </form>
  )
}
