import { useDraggable } from '@dnd-kit/core';
import { useSchemaStore } from '../store/schemaStore';
import { Trash2, Edit, GripVertical } from 'lucide-react';
import { useState } from 'react';
import FieldList from './FieldList';

interface EntityCardProps {
  entity: {
    id: string;
    name: string;
    fields: any[];
    position?: { x: number; y: number };
  };
  isDragging?: boolean;
}

const EntityCard = ({ entity, isDragging: isExternalDragging = false }: EntityCardProps) => {
  const { deleteEntity, updateEntity } = useSchemaStore();
  const [isEditing, setIsEditing] = useState(false);
  const [entityName, setEntityName] = useState(entity.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isInternalDragging,
  } = useDraggable({
    id: entity.id,
  });
  
  // Use external dragging state if provided, otherwise use internal
  const isDragging = isExternalDragging || isInternalDragging;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  const position = entity.position || { x: 100, y: 100 };

  const handleSave = () => {
    if (entityName.trim()) {
      updateEntity(entity.id, { name: entityName.trim() });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEntityName(entity.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 1000 : 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(12px)',
        borderColor: isDragging ? 'rgba(6, 182, 212, 0.5)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: isDragging ? '0 10px 40px rgba(6, 182, 212, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.2)',
        transition: isDragging ? 'none' : 'all 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      className="rounded-lg border-2 min-w-[280px] max-w-[320px]"
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 p-3 text-white rounded-t-lg cursor-move"
        style={{ background: 'linear-gradient(to right, #06b6d4, #14b8a6)' }}
        {...listeners}
        {...attributes}
      >
        <GripVertical size={18} className="text-white/80" />
        {isEditing ? (
          <input
            type="text"
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded text-sm font-semibold placeholder-white/60"
            style={{ border: '1px solid rgba(255, 255, 255, 0.3)' }}
            autoFocus
          />
        ) : (
          <h3
            className="flex-1 font-semibold text-lg cursor-text text-white"
            onDoubleClick={() => setIsEditing(true)}
          >
            {entity.name}
          </h3>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-white/20 rounded transition-colors text-white"
            title="Rename"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete entity "${entity.name}"?`)) {
                deleteEntity(entity.id);
              }
            }}
            className="p-1 hover:bg-red-500/80 rounded transition-colors text-white"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-3">
        <FieldList entityId={entity.id} fields={entity.fields} />
      </div>
    </div>
  );
};

export default EntityCard;


