import { useEffect, useState } from 'react';
import { useStore } from '@store/useStore';
import { supabase } from '@services/supabase';

export default function RoomPanel() {
  const { currentProject, rooms, setRooms, currentRoom, setCurrentRoom } = useStore();
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');

  useEffect(() => {
    if (currentProject) {
      loadRooms();
    }
  }, [currentProject]);

  const loadRooms = async () => {
    if (!currentProject) return;

    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('project_id', currentProject.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setRooms(data);
      if (data.length > 0 && !currentRoom) {
        setCurrentRoom(data[0]);
      }
    }
  };

  const handleAddRoom = async () => {
    if (!newRoomName.trim() || !currentProject) return;

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        project_id: currentProject.id,
        name: newRoomName,
        room_type: 'other',
        width: 5,
        length: 5,
        height: 3,
      })
      .select()
      .single();

    if (!error && data) {
      setRooms([...rooms, data]);
      setCurrentRoom(data);
      setNewRoomName('');
      setShowAddRoom(false);
    }
  };

  return (
    <div className="room-panel">
      <div className="panel-header">
        <h3>Rooms</h3>
        <button
          className="add-room-btn"
          onClick={() => setShowAddRoom(!showAddRoom)}
          title="Add Room"
        >
          +
        </button>
      </div>

      {showAddRoom && (
        <div className="add-room-form">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="Room name..."
            autoFocus
            onKeyPress={(e) => e.key === 'Enter' && handleAddRoom()}
          />
          <div className="form-actions">
            <button className="btn-sm btn-primary" onClick={handleAddRoom}>
              Add
            </button>
            <button className="btn-sm" onClick={() => setShowAddRoom(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="room-list">
        {rooms.length === 0 ? (
          <div className="empty-rooms">
            <p>No rooms yet</p>
            <button className="btn-link" onClick={() => setShowAddRoom(true)}>
              Create your first room
            </button>
          </div>
        ) : (
          rooms.map((room) => (
            <div
              key={room.id}
              className={`room-item ${currentRoom?.id === room.id ? 'active' : ''}`}
              onClick={() => setCurrentRoom(room)}
            >
              <div className="room-icon">
                {room.room_type === 'living' && '🛋️'}
                {room.room_type === 'bedroom' && '🛏️'}
                {room.room_type === 'kitchen' && '🍳'}
                {room.room_type === 'bathroom' && '🚿'}
                {room.room_type === 'office' && '💼'}
                {room.room_type === 'other' && '📦'}
              </div>
              <div className="room-info">
                <div className="room-name">{room.name}</div>
                {room.area && (
                  <div className="room-size">{room.area.toFixed(1)} m²</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .room-panel {
          width: 250px;
          background: var(--surface);
          border-right: 2px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-lg);
          border-bottom: 2px solid var(--border);
        }

        .panel-header h3 {
          font-size: 1.125rem;
          margin: 0;
        }

        .add-room-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--secondary);
          color: white;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition);
        }

        .add-room-btn:hover {
          transform: rotate(90deg) scale(1.1);
        }

        .add-room-form {
          padding: var(--spacing-md);
          border-bottom: 2px solid var(--border);
          background: var(--background);
        }

        .add-room-form input {
          width: 100%;
          padding: var(--spacing-sm);
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-sm);
          font-size: 0.875rem;
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
          border: 2px solid var(--border);
          background: var(--surface);
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all var(--transition);
        }

        .btn-sm.btn-primary {
          background: var(--secondary);
          color: white;
          border-color: var(--secondary);
        }

        .room-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-sm);
        }

        .room-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition);
          margin-bottom: var(--spacing-xs);
        }

        .room-item:hover {
          background: var(--background);
        }

        .room-item.active {
          background: var(--secondary);
          color: white;
        }

        .room-icon {
          font-size: 1.5rem;
        }

        .room-info {
          flex: 1;
        }

        .room-name {
          font-weight: 600;
          font-size: 0.9375rem;
        }

        .room-size {
          font-size: 0.75rem;
          opacity: 0.8;
        }

        .empty-rooms {
          padding: var(--spacing-xl);
          text-align: center;
          color: var(--text-secondary);
        }

        .empty-rooms p {
          margin-bottom: var(--spacing-md);
        }
      `}</style>
    </div>
  );
}