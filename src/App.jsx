import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LessonQuiz from './pages/LessonQuiz';
import PreLesson from './pages/PreLesson';
import Profile from './pages/Profile';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import Glossary from './pages/Glossary';
import GoodReads from './pages/GoodReads';
import OurTeam from './pages/OurTeam';
import ContactUs from './pages/ContactUs';
import ProUpgrade from './pages/ProUpgrade';
import SignIn from './pages/SignIn';
import Landing from './pages/Landing';
import Admin from './pages/Admin';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Quests from './pages/Quests'
import Messages from './pages/Messages';

function GAPageTracker() {
  const location = useLocation();
  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
  return null;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not signed in — landing page at /, sign-in everywhere else
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/upgrade" element={<ProUpgrade />} />
        <Route path="*" element={<SignIn />} />
      </Routes>
    );
  }

  // Signed in — full app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/lesson/:id" element={<LessonQuiz />} />
        <Route path="/pre-lesson/:id" element={<PreLesson />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/good-reads" element={<GoodReads />} />
        <Route path="/our-team" element={<OurTeam />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/upgrade" element={<ProUpgrade />} />
        <Route path="/quests" element={<Quests />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <GAPageTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App