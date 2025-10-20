import { useState } from 'react';
import { api } from '@services/supabase';
import { useStore } from '@store/useStore';

interface ProjectCardProps {
  project: any;
  onClick: () => void;
}

export default function ProjectCard({ project, onClick }: ProjectCardProps) {
  const { deleteProject } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await api.deleteProject(project.id);
        deleteProject(project.id);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
      }
    }
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#2ecc71';
      case 'completed': return '#3498db';
      case 'archived': return '#95a5a6';
      default: return '#f39c12';
    }
  };

  return (
    <div className="project-card" onClick={onClick}>
      <div className="card-image">
        {project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.name} />
        ) : (
          <div className="placeholder-image">
            <span className="placeholder-icon">🏠</span>
          </div>
        )}
        <div className="card-menu">
          <button className="menu-btn" onClick={handleMenuClick}>
            ⋮
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button className="menu-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>
                Edit
              </button>
              <button className="menu-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>
                Duplicate
              </button>
              <button className="menu-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }}>
                Export
              </button>
              <div className="menu-divider"></div>
              <button className="menu-item danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="card-title">{project.name}</h3>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(project.status) }}
          >
            {project.status}
          </span>
        </div>

        {project.description && (
          <p className="card-description">{project.description}</p>
        )}

        <div className="card-stats">
          {project.total_area && (
            <div className="stat">
              <span className="stat-icon">📐</span>
              <span className="stat-value">{project.total_area} m²</span>
            </div>
          )}
          {project.total_budget && (
            <div className="stat">
              <span className="stat-icon">💰</span>
              <span className="stat-value">${project.total_budget.toLocaleString()}</span>
            </div>
          )}
          {project.co2_footprint && (
            <div className="stat">
              <span className="stat-icon">🌱</span>
              <span className="stat-value">{project.co2_footprint.toFixed(1)} kg CO₂</span>
            </div>
          )}
        </div>

        <div className="card-footer">
          <span className="update-date">Updated {formatDate(project.updated_at)}</span>
        </div>
      </div>

      <style jsx>{`
        .project-card {
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: all var(--transition);
        }

        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px var(--shadow);
          border-color: var(--secondary);
        }

        .card-image {
          position: relative;
          height: 200px;
          background: var(--background);
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .placeholder-icon {
          font-size: 4rem;
          opacity: 0.8;
        }

        .card-menu {
          position: absolute;
          top: var(--spacing-sm);
          right: var(--spacing-sm);
        }

        .menu-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          cursor: pointer;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .menu-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        .menu-dropdown {
          position: absolute;
          top: calc(100% + var(--spacing-xs));
          right: 0;
          background: var(--surface);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: 0 4px 12px var(--shadow);
          min-width: 160px;
          z-index: 10;
        }

        .menu-item {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--text-primary);
          transition: background var(--transition);
        }

        .menu-item:hover {
          background: var(--background);
        }

        .menu-item.danger {
          color: var(--accent);
        }

        .menu-divider {
          height: 1px;
          background: var(--border);
          margin: var(--spacing-xs) 0;
        }

        .card-content {
          padding: var(--spacing-lg);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--spacing-md);
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          flex: 1;
        }

        .status-badge {
          padding: 2px var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
          text-transform: capitalize;
        }

        .card-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-bottom: var(--spacing-md);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-stats {
          display: flex;
          gap: var(--spacing-lg);
          margin-bottom: var(--spacing-md);
          flex-wrap: wrap;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.875rem;
        }

        .stat-icon {
          font-size: 1rem;
        }

        .stat-value {
          font-weight: 600;
          color: var(--text-primary);
        }

        .card-footer {
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--border);
        }

        .update-date {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}