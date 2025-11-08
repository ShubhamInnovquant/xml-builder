import { useState } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { Plus, X } from 'lucide-react';

const EntityPanel = () => {
  const { currentSchema, addEntity } = useSchemaStore();
  const [entityName, setEntityName] = useState('');

  const handleAddEntity = () => {
    if (entityName.trim()) {
      const x = Math.random() * 400 + 100;
      const y = Math.random() * 300 + 100;
      addEntity(entityName.trim(), { x, y });
      setEntityName('');
    }
  };

  if (!currentSchema) return null;

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4 text-gray-100">Add Entity</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Entity Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddEntity();
              }}
              placeholder="e.g., User, Product"
              className="input-field flex-1"
              autoFocus
            />
            <button
              onClick={handleAddEntity}
              disabled={!entityName.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        <div className="border-t pt-3 mt-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Existing Entities ({currentSchema.entities.length})
          </h4>
          <div className="space-y-2">
            {currentSchema.entities.map((entity) => (
              <div
                key={entity.id}
                className="p-2 rounded border"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="font-medium text-sm text-gray-100">{entity.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {entity.fields.length} field{entity.fields.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
            {currentSchema.entities.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No entities yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityPanel;


