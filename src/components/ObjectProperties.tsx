import { useState, useEffect } from 'react';

interface ObjectPropertiesProps {
  object: any;
}

export default function ObjectProperties({ object }: ObjectPropertiesProps) {
  const [properties, setProperties] = useState({
    name: '',
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    rotation: 0,
    color: '#3498db',
  });

  useEffect(() => {
    if (object) {
      setProperties({
        name: object.data?.name || 'Object',
        width: object.width * (object.scaleX || 1),
        height: object.height * (object.scaleY || 1),
        x: object.left || 0,
        y: object.top || 0,
        rotation: object.angle || 0,
        color: object.fill || '#3498db',
      });
    }
  }, [object]);

  const handleChange = (key: string, value: any) => {
    setProperties({ ...properties, [key]: value });

    if (object) {
      switch (key) {
        case 'width':
          object.set({ scaleX: value / object.width });
          break;
        case 'height':
          object.set({ scaleY: value / object.height });
          break;
        case 'x':
          object.set({ left: value });
          break;
        case 'y':
          object.set({ top: value });
          break;
        case 'rotation':
          object.set({ angle: value });
          break;
        case 'color':
          object.set({ fill: value });
          break;
      }
      object.canvas?.renderAll();
    }
  };

  if (!object) return null;

  return (
    <div className="properties-panel">
      <div className="panel-header">
        <h3>Properties</h3>
      </div>

      <div className="properties-content">
        <div className="property-group">
          <label>Name</label>
          <input
            type="text"
            value={properties.name}
            onChange={(e) => handleChange('name', e.target.value)}
          />
        </div>

        <div className="property-group">
          <label>Position</label>
          <div className="property-row">
            <div className="property-field">
              <span className="field-label">X</span>
              <input
                type="number"
                value={Math.round(properties.x)}
                onChange={(e) => handleChange('x', parseFloat(e.target.value))}
              />
            </div>
            <div className="property-field">
              <span className="field-label">Y</span>
              <input
                type="number"
                value={Math.round(properties.y)}
                onChange={(e) => handleChange('y', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="property-group">
          <label>Size</label>
          <div className="property-row">
            <div className="property-field">
              <span className="field-label">W</span>
              <input
                type="number"
                value={Math.round(properties.width)}
                onChange={(e) => handleChange('width', parseFloat(e.target.value))}
              />
            </div>
            <div className="property-field">
              <span className="field-label">H</span>
              <input
                type="number"
                value={Math.round(properties.height)}
                onChange={(e) => handleChange('height', parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="property-group">
          <label>Rotation</label>
          <div className="rotation-control">
            <input
              type="range"
              min="0"
              max="360"
              value={properties.rotation}
              onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
            />
            <input
              type="number"
              value={Math.round(properties.rotation)}
              onChange={(e) => handleChange('rotation', parseFloat(e.target.value))}
              className="rotation-input"
            />
            <span>°</span>
          </div>
        </div>

        <div className="property-group">
          <label>Fill Color</label>
          <div className="color-control">
            <input
              type="color"
              value={properties.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={properties.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="color-input"
            />
          </div>
        </div>

        <div className="property-actions">
          <button className="btn-action">Duplicate</button>
          <button className="btn-action danger">Delete</button>
        </div>
      </div>

      <style jsx>{`
        .properties-panel {
          width: 280px;
          background: var(--surface);
          border-left: 2px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          padding: var(--spacing-lg);
          border-bottom: 2px solid var(--border);
        }

        .panel-header h3 {
          font-size: 1.125rem;
          margin: 0;
        }

        .properties-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
        }

        .property-group {
          margin-bottom: var(--spacing-lg);
        }

        .property-group label {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: var(--spacing-sm);
          color: var(--text-primary);
        }

        .property-group input[type="text"],
        .property-group input[type="number"] {
          width: 100%;
          padding: var(--spacing-sm);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
        }

        .property-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-sm);
        }

        .property-field {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
        }

        .field-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .property-field input {
          flex: 1;
        }

        .rotation-control {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .rotation-control input[type="range"] {
          flex: 1;
        }

        .rotation-input {
          width: 60px !important;
        }

        .color-control {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .color-picker {
          width: 50px;
          height: 40px;
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .color-input {
          flex: 1;
        }

        .property-actions {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-xl);
        }

        .btn-action {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 2px solid var(--border);
          background: var(--surface);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all var(--transition);
        }

        .btn-action:hover {
          background: var(--background);
        }

        .btn-action.danger {
          color: var(--accent);
          border-color: var(--accent);
        }

        .btn-action.danger:hover {
          background: var(--accent);
          color: white;
        }
      `}</style>
    </div>
  );
}