import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { useAuth } from './lib/AuthContext'
import Auth from './pages/Auth'
import Chatbot from './pages/Chatbot'
import Dashboard from './pages/Dashboard'
import Grammar from './pages/Grammar'
import GrammarLesson from './pages/GrammarLesson'
import GrammarTopic from './pages/GrammarTopic'
import Lesson from './pages/Lesson'
import Listening from './pages/Listening'
import ListeningLesson from './pages/ListeningLesson'
import Mistakes from './pages/Mistakes'
import MistakesSession from './pages/MistakesSession'
import Practice from './pages/Practice'
import Profile from './pages/Profile'
import Review from './pages/Review'
import ReviewSession from './pages/ReviewSession'
import Speaking from './pages/Speaking'
import SpeakingLesson from './pages/SpeakingLesson'
import Writing from './pages/Writing'
import WritingLesson from './pages/WritingLesson'

function RequireUser({ children }) {
  const { user, loading, hydrated } = useAuth()
  if (loading) return null // avoid flashing a redirect while the session check is in flight
  if (!user) return <Navigate to="/auth" replace />
  if (!hydrated) return <LoadingScreen /> // pulling authoritative progress down from Supabase
  return children
}

function LoadingScreen() {
  return (
    <div className="px-5 pt-8 flex flex-col gap-6 animate-pulse" aria-label="Loading your progress">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-32 rounded bg-gray-200" />
        <div className="h-6 w-40 rounded bg-gray-200" />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 h-16 rounded-2xl bg-gray-100" />
        <div className="flex-1 h-16 rounded-2xl bg-gray-100" />
      </div>
      <div className="h-16 rounded-2xl bg-gray-100" />
      <div className="flex flex-col gap-3">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="h-20 rounded-2xl bg-gray-100" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/lesson/:unitId"
        element={
          <RequireUser>
            <Lesson />
          </RequireUser>
        }
      />

      <Route
        path="/grammar/:topicId/practice"
        element={
          <RequireUser>
            <GrammarLesson />
          </RequireUser>
        }
      />

      <Route
        path="/review/session"
        element={
          <RequireUser>
            <ReviewSession />
          </RequireUser>
        }
      />

      <Route
        path="/mistakes/session"
        element={
          <RequireUser>
            <MistakesSession />
          </RequireUser>
        }
      />

      <Route
        path="/listening/:lessonId"
        element={
          <RequireUser>
            <ListeningLesson />
          </RequireUser>
        }
      />

      <Route
        path="/speaking/:topicId"
        element={
          <RequireUser>
            <SpeakingLesson />
          </RequireUser>
        }
      />

      <Route
        path="/writing/:topicId"
        element={
          <RequireUser>
            <WritingLesson />
          </RequireUser>
        }
      />

      <Route
        element={
          <RequireUser>
            <Layout />
          </RequireUser>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/grammar" element={<Grammar />} />
        <Route path="/grammar/:topicId" element={<GrammarTopic />} />
        <Route path="/listening" element={<Listening />} />
        <Route path="/speaking" element={<Speaking />} />
        <Route path="/writing" element={<Writing />} />
        <Route path="/review" element={<Review />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
