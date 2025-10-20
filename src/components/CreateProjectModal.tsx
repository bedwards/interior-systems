import { useState } from 'react';

interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (project: any) => void;
}

export default function CreateProjectModal({ onClose, onCreate }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'draft',
    total_budget: '',
    total_area: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      ...formData,
      total_budget: formData.total_budget ? parseFloat(formData.total_budget) : null,
      total_area: formData.total_area ? parseFloat(formData.total_area) : null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="My Beautiful Living Room"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project goals and vision..."
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_budget">Budget ($)</label>
              <input
                id="total_budget"
                name="total_budget"
                type="number"
                value={formData.total_budget}
                onChange={handleChange}
                placeholder="10000"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="total_area">Total Area (m²)</label>
              <input
                id="total_area"
                name="total_area"
                type="number"
                value={formData.total_area}
                onChange={handleChange}
                placeholder="50"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
        }

        .modal-content {
          background: var(--surface);
          border-radius: var(--radius-lg);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 2px solid var(--border);
        }

        .modal-header h2 {
          font-size: 1.5rem;
          margin: 0;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: transparent;
          border: 2px solid var(--border);
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .close-btn:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }

        .modal-form {
          padding: var(--spacing-lg);
        }

        .form-group {
          margin-bottom: var(--spacing-lg);
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: var(--spacing-md);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-family: inherit;
          transition: border-color var(--transition);
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--secondary);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-md);
          padding-top: var(--spacing-lg);
          border-top: 2px solid var(--border);
        }

        .btn-secondary {
          background: var(--background);
          color: var(--text-primary);
          border: 2px solid var(--border);
        }

        .btn-secondary:hover {
          background: var(--border);
        }

        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}