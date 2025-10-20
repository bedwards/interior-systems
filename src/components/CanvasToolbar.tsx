interface CanvasToolbarProps {
  tool: 'select' | 'rect' | 'circle' | 'line';
  onToolChange: (tool: 'select' | 'rect' | 'circle' | 'line') => void;
  onAddShape: (type: 'rect' | 'circle') => void;
  onSave: () => void;
}

export default function CanvasToolbar({ tool, onToolChange, onAddShape, onSave }: CanvasToolbarProps) {
  return (
    <div className="canvas-toolbar">
      <div className="toolbar-section">
        <button
          className={`tool-btn ${tool === 'select' ? 'active' : ''}`}
          onClick={() => onToolChange('select')}
          title="Select (V)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 2l6 16 3-7 7-3z" />
          </svg>
        </button>

        <div className="toolbar-divider"></div>

        <button
          className="tool-btn"
          onClick={() => onAddShape('rect')}
          title="Rectangle (R)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="14" height="14" />
          </svg>
        </button>

        <button
          className="tool-btn"
          onClick={() => onAddShape('circle')}
          title="Circle (C)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="7" />
          </svg>
        </button>

        <button
          className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
          onClick={() => onToolChange('line')}
          title="Line (L)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="17" x2="17" y2="3" />
          </svg>
        </button>
      </div>

      <div className="toolbar-section">
        <button className="tool-btn" title="Undo (Ctrl+Z)">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 5v4H4V5h4m0-2H4c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm10 8l-4 4-1.41-1.41L14.17 12H10v-2h4.17l-1.58-1.59L14 7l4 4z" />
          </svg>
        </button>

        <button className="tool-btn" title="Redo (Ctrl+Shift+Z)">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M12 5v4h4V5h-4m0-2h4c1.1 0 2 .9 2 2v4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2zM2 13l4-4 1.41 1.41L5.83 12H10v2H5.83l1.58 1.59L6 17l-4-4z" />
          </svg>
        </button>

        <div className="toolbar-divider"></div>

        <button className="tool-btn" title="Zoom In (+)">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm.5-7H9v2H7v1h2v2h1v-2h2V9h-2z" />
          </svg>
        </button>

        <button className="tool-btn" title="Zoom Out (-)">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h5v1H7z" />
          </svg>
        </button>

        <button className="tool-btn" title="Fit to Screen">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M4 4h6v2H6v4H4V4zm10 0h6v6h-2V6h-4V4zM4 14h2v4h4v2H4v-6zm16 0h-2v4h-4v2h6v-6z" />
          </svg>
        </button>
      </div>

      <div className="toolbar-section">
        <button className="btn btn-primary" onClick={onSave}>
          💾 Save
        </button>

        <button className="tool-btn" title="Export">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
          </svg>
        </button>

        <button className="tool-btn" title="Settings">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15.95 10.78c.03-.25.05-.51.05-.78s-.02-.53-.06-.78l1.69-1.32c.15-.12.19-.34.1-.51l-1.6-2.77c-.1-.18-.31-.24-.49-.18l-1.99.8c-.42-.32-.86-.58-1.35-.78L12 2.34c-.03-.2-.2-.34-.4-.34H8.4c-.2 0-.36.14-.39.34l-.3 2.12c-.49.2-.94.47-1.35.78l-1.99-.8c-.18-.07-.39 0-.49.18l-1.6 2.77c-.1.18-.06.39.1.51l1.69 1.32c-.04.25-.07.52-.07.78s.02.53.06.78L2.37 12.1c-.15.12-.19.34-.1.51l1.6 2.77c.1.18.31.24.49.18l1.99-.8c.42.32.86.58 1.35.78l.3 2.12c.04.2.2.34.4.34h3.2c.2 0 .37-.14.39-.34l.3-2.12c.49-.2.94-.47 1.35-.78l1.99.8c.18.07.39 0 .49-.18l1.6-2.77c.1-.18.06-.39-.1-.51l-1.67-1.32zM10 13c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z" />
          </svg>
        </button>
      </div>

      <style jsx>{`
        .canvas-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md) var(--spacing-lg);
          background: var(--surface);
          border-bottom: 2px solid var(--border);
          box-shadow: 0 2px 4px var(--shadow);
          gap: var(--spacing-lg);
        }

        .toolbar-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .tool-btn {
          width: 40px;
          height: 40px;
          border: 2px solid var(--border);
          background: var(--surface);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition);
          color: var(--text-primary);
        }

        .tool-btn:hover {
          background: var(--background);
          border-color: var(--secondary);
        }

        .tool-btn.active {
          background: var(--secondary);
          border-color: var(--secondary);
          color: white;
        }

        .toolbar-divider {
          width: 1px;
          height: 24px;
          background: var(--border);
          margin: 0 var(--spacing-sm);
        }

        @media (max-width: 768px) {
          .canvas-toolbar {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}