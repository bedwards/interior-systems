import { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { useStore } from '@store/useStore';
import { setupRealtimeSubscription, supabase } from '@services/supabase';
import CanvasToolbar from './CanvasToolbar';
import RoomPanel from './RoomPanel';
import ObjectProperties from './ObjectProperties';

export default function ProjectCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const { currentProject, currentRoom, objects, setObjects } = useStore();
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [tool, setTool] = useState<'select' | 'rect' | 'circle' | 'line'>('select');
  const [collaborators, setCollaborators] = useState<any[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize Fabric.js canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 1200,
      height: 800,
      backgroundColor: '#ffffff',
    });

    fabricCanvasRef.current = canvas;

    // Load room canvas data if exists
    if (currentRoom?.canvas_data) {
      canvas.loadFromJSON(currentRoom.canvas_data, () => {
        canvas.renderAll();
      });
    }

    // Handle object selection
    canvas.on('selection:created', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:updated', (e) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
    });

    // Handle object modifications
    canvas.on('object:modified', async (e) => {
      if (!currentRoom) return;
      
      const obj = e.target;
      if (!obj) return;

      // Save to Supabase
      const { data, error } = await supabase
        .from('objects')
        .update({
          position_x: obj.left,
          position_y: obj.top,
          width: obj.width! * (obj.scaleX || 1),
          height: obj.height! * (obj.scaleY || 1),
          rotation: obj.angle,
        })
        .eq('id', obj.data?.id)
        .select()
        .single();

      if (!error && data) {
        // Update local store
        const updatedObjects = objects.map((o) =>
          o.id === data.id ? data : o
        );
        setObjects(updatedObjects);
      }
    });

    return () => {
      canvas.dispose();
    };
  }, [currentRoom]);

  useEffect(() => {
    if (!currentProject) return;

    // Setup realtime collaboration
    const channel = setupRealtimeSubscription(currentProject.id, {
      onObjectUpdate: (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          // Update canvas with new object data
          const canvas = fabricCanvasRef.current;
          if (!canvas) return;

          const newObj = payload.new;
          const existingObj = canvas.getObjects().find((o) => o.data?.id === newObj.id);

          if (existingObj) {
            existingObj.set({
              left: newObj.position_x,
              top: newObj.position_y,
              width: newObj.width,
              height: newObj.height,
              angle: newObj.rotation,
            });
            canvas.renderAll();
          } else {
            // Add new object to canvas
            addObjectToCanvas(newObj);
          }
        }
      },
    });

    // Presence - show cursors of other collaborators
    const presenceChannel = supabase.channel(`presence:${currentProject.id}`, {
      config: { presence: { key: 'cursor' } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state).flat();
        setCollaborators(users as any[]);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            cursor: { x: 0, y: 0 },
          });
        }
      });

    return () => {
      channel.unsubscribe();
      presenceChannel.unsubscribe();
    };
  }, [currentProject]);

  const addObjectToCanvas = (objectData: any) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    let fabricObject: fabric.Object;

    switch (objectData.object_type) {
      case 'rectangle':
        fabricObject = new fabric.Rect({
          left: objectData.position_x || 100,
          top: objectData.position_y || 100,
          width: objectData.width || 100,
          height: objectData.height || 100,
          fill: objectData.color || '#3498db',
          angle: objectData.rotation || 0,
        });
        break;
      case 'circle':
        fabricObject = new fabric.Circle({
          left: objectData.position_x || 100,
          top: objectData.position_y || 100,
          radius: (objectData.width || 100) / 2,
          fill: objectData.color || '#e74c3c',
          angle: objectData.rotation || 0,
        });
        break;
      default:
        fabricObject = new fabric.Rect({
          left: objectData.position_x || 100,
          top: objectData.position_y || 100,
          width: objectData.width || 100,
          height: objectData.height || 100,
          fill: objectData.color || '#95a5a6',
        });
    }

    fabricObject.data = { id: objectData.id };
    canvas.add(fabricObject);
    canvas.renderAll();
  };

  const handleToolChange = (newTool: typeof tool) => {
    setTool(newTool);
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    if (newTool === 'select') {
      canvas.isDrawingMode = false;
      canvas.selection = true;
    } else {
      canvas.selection = false;
    }
  };

  const handleAddShape = async (shapeType: 'rect' | 'circle') => {
    if (!currentRoom) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // Create object in database first
    const { data, error } = await supabase
      .from('objects')
      .insert({
        room_id: currentRoom.id,
        name: `New ${shapeType}`,
        object_type: shapeType === 'rect' ? 'rectangle' : 'circle',
        position_x: 100,
        position_y: 100,
        width: 100,
        height: 100,
        color: shapeType === 'rect' ? '#3498db' : '#e74c3c',
      })
      .select()
      .single();

    if (!error && data) {
      addObjectToCanvas(data);
      setObjects([...objects, data]);
    }
  };

  const handleSaveCanvas = async () => {
    if (!currentRoom) return;

    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const canvasData = canvas.toJSON(['data']);

    const { error } = await supabase
      .from('rooms')
      .update({ canvas_data: canvasData })
      .eq('id', currentRoom.id);

    if (error) {
      console.error('Error saving canvas:', error);
    } else {
      console.log('Canvas saved successfully');
    }
  };

  if (!currentProject) {
    return <div>No project selected</div>;
  }

  return (
    <div className="project-canvas-container">
      <CanvasToolbar
        tool={tool}
        onToolChange={handleToolChange}
        onAddShape={handleAddShape}
        onSave={handleSaveCanvas}
      />
      
      <div className="canvas-workspace">
        <RoomPanel />
        
        <div className="canvas-area">
          <div className="collaborators">
            {collaborators.map((collab, idx) => (
              <div key={idx} className="collaborator-cursor" style={{
                left: collab.cursor?.x || 0,
                top: collab.cursor?.y || 0,
              }}>
                <div className="cursor-icon">▲</div>
                <div className="cursor-label">{collab.user_id?.slice(0, 8)}</div>
              </div>
            ))}
          </div>
          
          <canvas ref={canvasRef} />
        </div>
        
        {selectedObject && <ObjectProperties object={selectedObject} />}
      </div>
    </div>
  );
}