import { useEffect, useState } from 'react';
import { useStore } from '@store/useStore';
import { api } from '@services/supabase';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';

export default function Dashboard() {
  const { projects, setProjects, setCurrentProject } = useStore();
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const newProject = await api.createProject(projectData);
      setProjects([...projects, newProject]);
      setShowCreateModal(false);
      setCurrentProject(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const filteredProjects = projects.filter((p) => 
    filter === 'all' ? true : p.status === filter
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your projects...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Your Projects</h1>
          <p className="subtitle">Design with intelligence, collaborate with ease</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + New Project
        </button>
      </div>

      <div className="dashboard-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Projects
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active
        </button>
        <button
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed
        </button>
        <button
          className={`filter-btn ${filter === 'archived' ? 'active' : ''}`}
          onClick={() => setFilter('archived')}
        >
          Archived
        </button>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="20" y="30" width="80" height="60" rx="4" stroke="currentColor" strokeWidth="2" />
            <path d="M30 50h60M30 70h40M30 60h50" stroke="currentColor" strokeWidth="2" />
          </svg>
          <h3>No projects yet</h3>
          <p>Create your first interior design project to get started</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setCurrentProject(project)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}