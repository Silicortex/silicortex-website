'use client'

import { useActionState } from 'react'
import { loginAction, type LoginState } from './actions.ts'

const initialState: LoginState = { error: null }

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState)

  return (
    <form action={action} className="flex flex-col gap-3">
      <label
        htmlFor="password"
        className="text-[10px] font-bold uppercase tracking-widest text-slate-400"
      >
        Passwort
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        className="rounded-lg border border-black/8 bg-white px-3 py-2 text-slate-900 transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-60"
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
