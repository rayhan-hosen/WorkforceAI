import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import Register from './components/Register'
import Assessment from './components/Assessment'
import Dashboard from './components/Dashboard'
import LearningMap from './components/LearningMap'
import JobDemandMap from './components/JobDemandMap'
import JobMatching from './components/JobMatching'
import Leaderboard from './components/Leaderboard'
import Assistant from './components/Assistant'
import Marketplace from './components/Marketplace'
import Community from './components/Community'
import Insights from './components/Insights'
import ProfileEditor from './components/ProfileEditor'
import FloatingChatBox from './components/FloatingChatBox'

function App() {
  return (
    <LanguageProvider>
      <Router>
        {/* Premium Navbar - Appears on all pages except landing/register */}
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learning" element={<LearningMap />} />
          <Route path="/learning/:levelId" element={<LearningMap />} />
          <Route path="/job-demand" element={<JobDemandMap />} />
          <Route path="/job-matching" element={<JobMatching />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/profile-edit" element={<ProfileEditor />} />
          <Route path="/community" element={<Community />} />
          <Route path="/insights" element={<Insights />} />
        </Routes>
        {/* Floating Chat Box - Available on all pages */}
        <FloatingChatBox />
      </Router>
    </LanguageProvider>
  )
}

export default App

