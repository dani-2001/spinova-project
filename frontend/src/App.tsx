import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './components/HomePage'
import AboutPage from './components/AboutPage'
import HowItWorksPage from './components/HowItWorksPage'
import SignInPage from './components/SignInPage'
import Workspace from './components/Workspace'
import HomeFab from './components/HomeFab'
import PageTransition from './components/PageTransition'
import './App.css'

interface User {
  email: string
  name: string
}

export default function App() {
  // No auth backend exists yet — `user` is set locally by SignInPage's
  // sign-in/register form once it's filled in validly. Swap for a real
  // session/JWT check once Django has an auth endpoint.
  const [user, setUser] = useState<User | null>(null)

  return (
    <>
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route
            path="/signin"
            element={user ? <Navigate to="/workspace" replace /> : <SignInPage onEnter={setUser} />}
          />
          <Route
            path="/workspace"
            element={
              user
                ? <Workspace user={user} onSignOut={() => setUser(null)} />
                : <Navigate to="/signin" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </>
  )
}
