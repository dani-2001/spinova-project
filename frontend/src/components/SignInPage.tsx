import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import TopNav from './TopNav'
import Reveal from './Reveal'

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M2 12s3.8-7 10-7 10 7 10 7-3.8 7-10 7-10-7-10-7Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      {off && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.6" />}
    </svg>
  )
}

interface SignInProps {
  onEnter: (user: { email: string; name: string }) => void
}

type Mode = 'signin' | 'register'

interface FormState {
  name: string
  facility: string
  email: string
  password: string
}

export default function SignInPage({ onEnter }: SignInProps) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('signin')
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState<FormState>({ name: '', facility: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)

  const update = (field: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const validateEmail = (value: string) => /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/u.test(value)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Enter your email and password.')
      return
    }
    if (!validateEmail(form.email)) {
      setError('Enter a valid hospital email address.')
      return
    }
    if (mode === 'register' && !form.name) {
      setError('Enter your name.')
      return
    }
    setError(null)
    // No auth backend exists yet — replace this with a real Django auth call later.
    onEnter({ email: form.email, name: form.name || form.email.split('@')[0] })
    navigate('/workspace')
  }

  return (
    <main className="min-h-screen bg-cream text-navy">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-10 lg:px-10 lg:py-14">
        <TopNav />

        <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <Reveal className="space-y-5" as="div">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-navy sm:text-5xl">
                Sign in to start screening
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600">
                Clinicians and staff sign in with their hospital email. New here? Create an account — the workspace guides you through marking levels.
              </p>
            </div>
            <p className="rounded-3xl bg-white/90 px-5 py-4 text-sm text-slate-600 shadow-soft">
              Use your trusted hospital account for the secure clinical review workflow.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-teal" />
                Sign in or create an account for the clinical dashboard.
              </div>

              <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1 text-sm font-semibold text-slate-700">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null) }}
                  className={`rounded-2xl px-4 py-3 transition ${mode === 'signin' ? 'bg-white text-navy shadow' : 'text-slate-500 hover:text-navy'}`}
                  aria-selected={mode === 'signin'}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null) }}
                  className={`rounded-2xl px-4 py-3 transition ${mode === 'register' ? 'bg-white text-navy shadow' : 'text-slate-500 hover:text-navy'}`}
                  aria-selected={mode === 'register'}
                >
                  Create account
                </button>
              </div>

              <form onSubmit={submit} className="space-y-5" noValidate>
                {mode === 'register' && (
                  <div className="space-y-5">
                    <label className="block text-sm font-medium text-slate-700">
                      Full name
                      <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        placeholder="Dr. Amina Mushi"
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Facility (optional)
                      <input
                        type="text"
                        value={form.facility}
                        onChange={update('facility')}
                        placeholder="Mbeya Regional Referral Hospital"
                        className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
                      />
                    </label>
                  </div>
                )}

                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    placeholder="you@hospital.go.tz"
                    autoComplete="email"
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20"
                  />
                  <span className="mt-2 block text-sm text-slate-500">Enter the email you use for hospital clinical systems.</span>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Password
                  <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 transition focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/20">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={form.password}
                      onChange={update('password')}
                      placeholder="••••••••"
                      autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                      className="flex-1 bg-transparent text-sm text-slate-900 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                      className="rounded-full p-2 text-slate-600 transition hover:bg-slate-200"
                    >
                      <EyeIcon off={showPw} />
                    </button>
                  </div>
                </label>

                {mode === 'signin' ? (
                  <button type="button" className="text-sm font-semibold text-teal hover:text-teal-700">
                    Forgot password?
                  </button>
                ) : null}

                {error && (
                  <p className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full rounded-3xl bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
                >
                  {mode === 'signin' ? 'Sign in' : 'Create account'}
                </button>

                <p className="text-center text-sm text-slate-600">
                  {mode === 'signin' ? (
                    <>New here? <button type="button" className="font-semibold text-navy underline" onClick={() => setMode('register')}>Create an account</button></>
                  ) : (
                    <>Already registered? <button type="button" className="font-semibold text-navy underline" onClick={() => setMode('signin')}>Sign in</button></>
                  )}
                </p>
              </form>
            </div>
          </Reveal>
        </section>
      </div>
    </main>
  )
}
