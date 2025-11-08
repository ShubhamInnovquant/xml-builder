import { useState } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { Plus, Trash2 } from 'lucide-react';
import { RelationshipType } from '../types/schema';

const RelationshipPanel = () => {
  const { currentSchema, addRelationship, deleteRelationship } = useSchemaStore();
  const [fromEntityId, setFromEntityId] = useState('');
  const [toEntityId, setToEntityId] = useState('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('one-to-many');
  const [relationshipName, setRelationshipName] = useState('');

  if (!currentSchema || currentSchema.entities.length < 2) {
    return (
      <div className="p-4">
        <p className="text-sm text-gray-400">
          You need at least 2 entities to create relationships.
        </p>
      </div>
    );
  }

  const handleAddRelationship = () => {
    if (fromEntityId && toEntityId && fromEntityId !== toEntityId) {
      addRelationship({
        fromEntityId,
        toEntityId,
        type: relationshipType,
        name: relationshipName.trim() || undefined,
      });
      setFromEntityId('');
      setToEntityId('');
      setRelationshipName('');
      setRelationshipType('one-to-many');
    }
  };

  const getEntityName = (id: string) => {
    return currentSchema.entities.find((e) => e.id === id)?.name || id;
  };

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4 text-gray-100">Add Relationship</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            From Entity
          </label>
          <select
            value={fromEntityId}
            onChange={(e) => setFromEntityId(e.target.value)}
            className="input-field"
          >
            <option value="">Select entity</option>
            {currentSchema.entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Relationship Type
          </label>
          <select
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
            className="input-field"
          >
            <option value="one-to-one">One-to-One</option>
            <option value="one-to-many">One-to-Many</option>
            <option value="many-to-many">Many-to-Many</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            To Entity
          </label>
          <select
            value={toEntityId}
            onChange={(e) => setToEntityId(e.target.value)}
            className="input-field"
          >
            <option value="">Select entity</option>
            {currentSchema.entities
              .filter((e) => e.id !== fromEntityId)
              .map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Relationship Name (optional)
          </label>
          <input
            type="text"
            value={relationshipName}
            onChange={(e) => setRelationshipName(e.target.value)}
            placeholder="e.g., owns, belongs_to"
            className="input-field"
          />
        </div>

        <button
          onClick={handleAddRelationship}
          disabled={!fromEntityId || !toEntityId || fromEntityId === toEntityId}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Add Relationship
        </button>

        <div className="border-t pt-3 mt-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Existing Relationships ({currentSchema.relationships.length})
          </h4>
          <div className="space-y-2">
            {currentSchema.relationships.map((rel) => (
              <div
                key={rel.id}
                className="p-2 rounded border flex items-center justify-between"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-100">
                    <span className="font-medium">{getEntityName(rel.fromEntityId)}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="font-medium">{getEntityName(rel.toEntityId)}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {rel.type} {rel.name && `• ${rel.name}`}
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this relationship?')) {
                      deleteRelationship(rel.id);
                    }
                  }}
                  className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 ml-2 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {currentSchema.relationships.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">
                No relationships yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelationshipPanel;


