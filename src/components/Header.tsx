import { useState } from 'react';
import { useStore } from '@store/useStore';
import { supabase, syncOfflineData } from '@services/supabase';

export default function Header() {
  const { user, currentProject, setCurrentProject, isOnline } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSync = async () => {
    try {
      await syncOfflineData();
      alert('Offline changes synced successfully!');
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title" onClick={() => setCurrentProject(null)}>
          <span className="logo-icon">🏠</span>
          Interior Systems
        </h1>
        {currentProject && (
          <>
            <span className="breadcrumb-separator">/</span>
            <span className="project-name">{currentProject.name}</span>
          </>
        )}
      </div>

      <div className="header-right">
        {!isOnline && (
          <div className="offline-indicator">
            <span className="offline-dot"></span>
            Offline Mode
            <button onClick={handleSync} className="btn-sync">
              Sync
            </button>
          </div>
        )}

        <div className="user-menu">
          <button
            className="user-avatar"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-email">{user?.email}</div>
                <div className="user-id">ID: {user?.id?.slice(0, 8)}</div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                Settings
              </button>
              <button className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                Keyboard Shortcuts
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md) var(--spacing-xl);
          background: var(--surface);
          border-bottom: 2px solid var(--border);
          box-shadow: 0 2px 8px var(--shadow);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }

        .app-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          transition: color var(--transition);
        }

        .app-title:hover {
          color: var(--secondary);
        }

        .logo-icon {
          font-size: 1.75rem;
        }

        .breadcrumb-separator {
          color: var(--text-secondary);
          font-size: 1.25rem;
        }

        .project-name {
          font-size: 1.125rem;
          color: var(--text-secondary);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }

        .offline-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--warning);
          color: white;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .offline-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .btn-sync {
          margin-left: var(--spacing-sm);
          padding: 2px var(--spacing-sm);
          background: white;
          color: var(--warning);
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .user-menu {
          position: relative;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--secondary);
          color: white;
          border: none;
          font-size: 1.125rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition);
        }

        .user-avatar:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .user-dropdown {
          position: absolute;
          top: calc(100% + var(--spacing-sm));
          right: 0;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px var(--shadow);
          min-width: 220px;
          z-index: 1000;
        }

        .user-info {
          padding: var(--spacing-md);
        }

        .user-email {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: var(--spacing-xs);
        }

        .user-id {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border);
        }

        .dropdown-item {
          width: 100%;
          padding: var(--spacing-md);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: background var(--transition);
        }

        .dropdown-item:hover {
          background: var(--background);
        }

        .dropdown-item.danger {
          color: var(--accent);
        }

        .dropdown-item.danger:hover {
          background: #fee;
        }
      `}</style>
    </header>
  );
}