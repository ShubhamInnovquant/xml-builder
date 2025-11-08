import { useRef, useEffect, useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, PointerSensor } from '@dnd-kit/core';
import { useSchemaStore } from '../store/schemaStore';
import EntityCard from './EntityCard';
import RelationshipLine from './RelationshipLine';

const EntityCanvas = () => {
  const { currentSchema, updateEntityPosition } = useSchemaStore();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedEntity, setDraggedEntity] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        setCanvasSize({
          width: canvasRef.current.offsetWidth,
          height: canvasRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const entityId = active.id as string;
    const entity = currentSchema?.entities.find((e) => e.id === entityId);
    
    setActiveId(entityId);
    if (entity) {
      setDraggedEntity(entity);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    const entityId = active.id as string;
    const entity = currentSchema?.entities.find((e) => e.id === entityId);

    if (entity && entity.position && canvasRef.current) {
      // Get scroll position
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      // Calculate new position accounting for scroll
      const newX = Math.max(0, entity.position.x + delta.x);
      const newY = Math.max(0, entity.position.y + delta.y);
      
      // Optional: Add boundary constraints
      const maxX = Math.max(canvasSize.width * 2, 2000);
      const maxY = Math.max(canvasSize.height * 2, 2000);
      
      updateEntityPosition(entityId, {
        x: Math.min(newX, maxX),
        y: Math.min(newY, maxY),
      });
    }
    
    setActiveId(null);
    setDraggedEntity(null);
  };

  if (!currentSchema) return null;

  return (
    <DndContext 
      sensors={sensors} 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={canvasRef}
        className="w-full h-full relative overflow-auto"
        style={{
          backgroundColor: 'rgba(17, 24, 39, 0.6)',
          backgroundImage: `
            linear-gradient(to right, rgba(107, 114, 128, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(107, 114, 128, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      >
        {/* Relationship Lines - Behind entities */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ 
            width: '100%', 
            height: '100%',
            zIndex: 1,
          }}
        >
          <defs>
            {/* Arrow markers for different relationship types */}
            <marker
              id="arrowhead-one-to-one"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
            <marker
              id="arrowhead-one-to-many"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
            </marker>
            <marker
              id="arrowhead-many-to-many"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#f59e0b" />
            </marker>
          </defs>
          {currentSchema.relationships.map((relationship) => (
            <RelationshipLine
              key={relationship.id}
              relationship={relationship}
              entities={currentSchema.entities}
            />
          ))}
        </svg>

        {/* Entity Cards */}
        <div className="relative" style={{ zIndex: 2 }}>
          {currentSchema.entities.map((entity) => (
            <EntityCard 
              key={entity.id} 
              entity={entity}
              isDragging={activeId === entity.id}
            />
          ))}
        </div>

        {/* Drag Overlay - Shows entity being dragged */}
        <DragOverlay>
          {draggedEntity ? (
            <div
              style={{
                opacity: 0.8,
                transform: 'rotate(2deg)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(12px)',
                border: '2px solid rgba(6, 182, 212, 0.6)',
                borderRadius: '0.5rem',
                minWidth: '280px',
                maxWidth: '320px',
                boxShadow: '0 20px 60px rgba(6, 182, 212, 0.4)',
              }}
            >
              <div
                className="flex items-center gap-2 p-3 text-white rounded-t-lg"
                style={{ background: 'linear-gradient(to right, #06b6d4, #14b8a6)' }}
              >
                <h3 className="flex-1 font-semibold text-lg text-white">
                  {draggedEntity.name}
                </h3>
              </div>
              <div className="p-3">
                <div className="text-xs text-gray-400">
                  {draggedEntity.fields.length} field{draggedEntity.fields.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>

        {currentSchema.entities.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
            <div className="text-center text-gray-400">
              <p className="text-lg mb-2 text-gray-300">No entities yet</p>
              <p className="text-sm text-gray-400">Add an entity from the sidebar to get started</p>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
};

export default EntityCanvas;


