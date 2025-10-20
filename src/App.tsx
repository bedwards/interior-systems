import { useEffect, useState } from 'react';
import { supabase } from '@services/supabase';
import { useStore } from '@store/useStore';
import Auth from '@components/Auth';
import Dashboard from '@components/Dashboard';
import ProjectCanvas from '@components/ProjectCanvas';
import Sidebar from '@components/Sidebar';
import Header from '@components/Header';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const { user, setUser, currentProject } = useStore();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Interior Systems...</p>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="app">
      <Header />
      <div className="app-container">
        <Sidebar />
        <main className="main-content">
          {currentProject ? <ProjectCanvas /> : <Dashboard />}
        </main>
      </div>
    </div>
  );
}

export default App;