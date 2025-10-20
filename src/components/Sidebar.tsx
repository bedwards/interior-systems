import { useState } from 'react';
import { useStore } from '@store/useStore';

export default function Sidebar() {
  const { currentProject, setCurrentProject } = useStore();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', action: () => setCurrentProject(null) },
    { id: 'projects', label: 'Projects', icon: '📁', active: false },
    { id: 'palettes', label: 'Palettes', icon: '🎨', active: false },
    { id: 'materials', label: 'Materials', icon: '🧱', active: false },
    { id: 'vendors', label: 'Vendors', icon: '🏪', active: false },
    { id: 'analytics', label: 'Analytics', icon: '📈', active: false },
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed ? '→' : '←'}
      </button>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${item.id === 'dashboard' && !currentProject ? 'active' : ''}`}
            onClick={item.action || (() => {})}
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="storage-info">
            <div className="storage-label">Storage</div>
            <div className="storage-bar">
              <div className="storage-used" style={{ width: '35%' }}></div>
            </div>
            <div className="storage-text">3.5 GB / 10 GB</div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sidebar {
          width: 240px;
          background: var(--surface);
          border-right: 2px solid var(--border);
          display: flex;
          flex-direction: column;
          transition: width var(--transition);
          position: relative;
        }

        .sidebar.collapsed {
          width: 70px;
        }

        .collapse-btn {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-sm);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--background);
          border: 2px solid var(--border);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
          transition: all var(--transition);
          z-index: 10;
        }

        .collapse-btn:hover {
          background: var(--secondary);
          color: white;
          border-color: var(--secondary);
        }

        .sidebar-nav {
          flex: 1;
          padding: var(--spacing-xl) var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition);
          color: var(--text-primary);
          font-size: 0.9375rem;
          text-align: left;
          width: 100%;
        }

        .sidebar.collapsed .nav-item {
          justify-content: center;
        }

        .nav-item:hover {
          background: var(--background);
        }

        .nav-item.active {
          background: var(--secondary);
          color: white;
        }

        .nav-icon {
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .nav-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-footer {
          padding: var(--spacing-lg);
          border-top: 2px solid var(--border);
        }

        .storage-info {
          font-size: 0.75rem;
        }

        .storage-label {
          color: var(--text-secondary);
          margin-bottom: var(--spacing-xs);
          font-weight: 600;
        }

        .storage-bar {
          height: 6px;
          background: var(--background);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: var(--spacing-xs);
        }

        .storage-used {
          height: 100%;
          background: linear-gradient(90deg, var(--secondary), var(--success));
          transition: width 0.3s ease;
        }

        .storage-text {
          color: var(--text-secondary);
        }

        @media (max-width: 768px) {
          .sidebar {
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            z-index: 50;
            transform: translateX(-100%);
          }

          .sidebar.expanded {
            transform: translateX(0);
          }
        }
      `}</style>
    </aside>
  );
}