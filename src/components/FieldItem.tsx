import { useState } from 'react';
import { useSchemaStore } from '../store/schemaStore';
import { Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { DataType, Field } from '../types/schema';
import NestedFieldEditor from './NestedFieldEditor';

interface FieldItemProps {
  entityId: string;
  field: Field;
}

const FieldItem = ({ entityId, field }: FieldItemProps) => {
  const { updateField, deleteField, currentSchema } = useSchemaStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fieldName, setFieldName] = useState(field.name);
  const [fieldType, setFieldType] = useState<DataType>(field.type);
  const [required, setRequired] = useState(field.required);

  const availableEntities = currentSchema?.entities.map((e) => ({
    id: e.id,
    name: e.name,
  })) || [];

  const hasNested = 
    (field.type === 'object' && field.nestedFields && field.nestedFields.length > 0) ||
    (field.type === 'array' && field.arrayItemType);

  const handleSave = () => {
    if (fieldName.trim()) {
      updateField(entityId, field.id, {
        name: fieldName.trim(),
        type: fieldType,
        required,
      });
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setFieldName(field.name);
      setFieldType(field.type);
      setRequired(field.required);
      setIsEditing(false);
    }
  };

  const handleTypeChange = (newType: DataType) => {
    setFieldType(newType);
    // Reset nested structures when changing type
    if (newType !== 'object' && newType !== 'array') {
      updateField(entityId, field.id, {
        type: newType,
        nestedFields: undefined,
        arrayItemType: undefined,
      });
    } else if (newType === 'object') {
      updateField(entityId, field.id, {
        type: newType,
        nestedFields: [],
        arrayItemType: undefined,
      });
    } else if (newType === 'array') {
      updateField(entityId, field.id, {
        type: newType,
        arrayItemType: { type: 'primitive', value: 'string' },
        nestedFields: undefined,
      });
    }
  };

  if (isEditing) {
    return (
      <div className="p-2 rounded border" style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.5)' }}>
        <input
          type="text"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="input-field text-sm mb-2"
          autoFocus
        />
        <select
          value={fieldType}
          onChange={(e) => handleTypeChange(e.target.value as DataType)}
          className="input-field text-sm mb-2"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="date">Date</option>
          <option value="object">Object</option>
          <option value="array">Array</option>
          <option value="null">Null</option>
          <option value="undefined">Undefined</option>
        </select>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            className="rounded"
          />
          <label className="text-xs text-gray-300">Required</label>
        </div>
        <div className="flex gap-1">
          <button
            onClick={handleSave}
            className="flex-1 btn-primary text-xs py-1"
          >
            Save
          </button>
          <button
            onClick={() => {
              setFieldName(field.name);
              setFieldType(field.type);
              setRequired(field.required);
              setIsEditing(false);
            }}
            className="btn-secondary text-xs py-1 px-2"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded border transition-colors group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hasNested && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-0.5 hover:bg-gray-800/60 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-gray-400" />
              ) : (
                <ChevronRight size={14} className="text-gray-400" />
              )}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-100">{field.name}</span>
              {field.required && (
                <span className="text-xs text-red-400 font-semibold">*</span>
              )}
              {(field.type === 'object' || field.type === 'array') && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>
                  Complex
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {field.type}
              {field.type === 'array' && field.arrayItemType && (
                <span className="ml-1 text-gray-500">
                  {'<'}
                  {field.arrayItemType.type === 'primitive' && field.arrayItemType.value}
                  {field.arrayItemType.type === 'object' && 'Object'}
                  {field.arrayItemType.type === 'array' && 'Array'}
                  {field.arrayItemType.type === 'entity' && 'Entity'}
                  {'>'}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-800/60 rounded text-gray-400 hover:text-white transition-colors"
            title="Edit"
          >
            <Edit size={12} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete field "${field.name}"?`)) {
                deleteField(entityId, field.id);
              }
            }}
            className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Nested structure display */}
      {isExpanded && (
        <div className="px-2 pb-2 border-t pt-2" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {field.type === 'object' && field.nestedFields && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-2">Object Properties:</div>
              <NestedFieldEditor
                nestedFields={field.nestedFields}
                onUpdate={(nestedFields) => {
                  updateField(entityId, field.id, { nestedFields });
                }}
                availableEntities={availableEntities}
              />
            </div>
          )}

          {field.type === 'array' && field.arrayItemType && (
            <div>
              <div className="text-xs font-medium text-gray-300 mb-2">Array Item Type:</div>
              <div className="ml-4 pl-4 border-l-2" style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                {field.arrayItemType.type === 'primitive' && (
                  <div className="text-xs text-gray-400">
                    Type: {field.arrayItemType.value}
                  </div>
                )}
                {field.arrayItemType.type === 'object' && (
                  <div>
                    <div className="text-xs text-gray-400 mb-2">Object with properties:</div>
                    <NestedFieldEditor
                      nestedFields={field.arrayItemType.fields}
                      onUpdate={(fields) => {
                        updateField(entityId, field.id, {
                          arrayItemType: { type: 'object', fields },
                        });
                      }}
                      availableEntities={availableEntities}
                    />
                  </div>
                )}
                {field.arrayItemType.type === 'array' && (
                  <div className="text-xs text-gray-400">
                    Nested Array (configure in edit mode)
                  </div>
                )}
                {field.arrayItemType.type === 'entity' && (
                  <div className="text-xs text-gray-400">
                    References: {availableEntities.find(e => e.id === (field.arrayItemType as any).entityId)?.name || 'Unknown'}
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasNested && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs text-electric-400 hover:text-teal-400 transition-colors"
            >
              Click to configure nested structure
            </button>
          )}
        </div>
      )}

      {!isExpanded && (field.type === 'object' || field.type === 'array') && (
        <div className="px-2 pb-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-xs text-electric-400 hover:text-teal-400 transition-colors"
          >
            {field.type === 'object' && field.nestedFields && field.nestedFields.length > 0
              ? `View ${field.nestedFields.length} properties`
              : field.type === 'array' && field.arrayItemType
              ? 'View array configuration'
              : 'Configure nested structure'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FieldItem;

