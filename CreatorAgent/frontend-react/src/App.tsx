import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, Link } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { DashboardLayout } from './components/DashboardLayout';

// Public Marketing & Legal Pages
import { Home } from './pages/public/Home';
import { Features } from './pages/public/Features';
import { HowItWorks } from './pages/public/HowItWorks';
import { AIAgents } from './pages/public/AIAgents';
import { Pricing } from './pages/public/Pricing';
import { Blog } from './pages/public/Blog';
import { BlogPost } from './pages/public/BlogPost';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { PrivacyPolicy } from './pages/public/PrivacyPolicy';
import { TermsOfUse } from './pages/public/TermsOfUse';
import { CopyrightPolicy } from './pages/public/CopyrightPolicy';
import { CookiePolicy } from './pages/public/CookiePolicy';

// Authenticated Studio Application Pages
import { DashboardOverview } from './pages/app/DashboardOverview';
import { NewProject } from './pages/app/NewProject';
import { MyProjects } from './pages/app/MyProjects';
import { StudioWorkspace } from './pages/app/StudioWorkspace';
import { AIAgentsStudio } from './pages/app/AIAgentsStudio';
import { CaptionsStudio } from './pages/app/CaptionsStudio';
import { MetadataStudio } from './pages/app/MetadataStudio';
import { YouTubeStudio } from './pages/app/YouTubeStudio';
import { PublishingCalendar } from './pages/app/PublishingCalendar';
import { JobHistory } from './pages/app/JobHistory';
import { ConnectedAccounts } from './pages/app/ConnectedAccounts';
import { Settings } from './pages/app/Settings';
import { HelpSupport } from './pages/app/HelpSupport';

import { OAuthHandler } from './components/OAuthHandler';

// Layout wrapper for Public Pages
const PublicLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-black)' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Custom 404 Not Found Page
const NotFound: React.FC = () => {
  return (
    <div style={{ padding: '96px 24px', textAlign: 'center', backgroundColor: 'var(--bg-black)' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <span className="badge badge-violet" style={{ marginBottom: '16px' }}>404 Error</span>
        <h1 style={{ fontSize: '2.5rem', color: '#FFFFFF', marginBottom: '12px' }}>Page Not Found</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>
          The studio route or resource you requested does not exist or has been relocated.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
          <Link to="/app" className="btn btn-secondary">
            Open Studio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <OAuthHandler />
      <Routes>
        {/* Public Marketing & Legal Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/ai-agents" element={<AIAgents />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/copyright" element={<CopyrightPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
        </Route>

        {/* Authenticated Studio Dashboard Routes */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="new" element={<NewProject />} />
          <Route path="projects" element={<MyProjects />} />
          <Route path="studio" element={<StudioWorkspace />} />
          <Route path="agents" element={<AIAgentsStudio />} />
          <Route path="captions" element={<CaptionsStudio />} />
          <Route path="metadata" element={<MetadataStudio />} />
          <Route path="youtube" element={<YouTubeStudio />} />
          <Route path="calendar" element={<PublishingCalendar />} />
          <Route path="jobs" element={<JobHistory />} />
          <Route path="accounts" element={<ConnectedAccounts />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>

        {/* Fallback 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
