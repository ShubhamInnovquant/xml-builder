import { useState } from 'react';
import { useJsonSchemaStore } from '../store/jsonSchemaStore';
import { JsonSchemaField, JsonSchemaType } from '../types/jsonSchema';
import { ChevronDown, ChevronRight, Trash2, Edit, ArrowUp, ArrowDown, Plus } from 'lucide-react';

interface JsonSchemaFieldEditorProps {
  field: JsonSchemaField;
  level: number;
  parentId?: string;
}

const JsonSchemaFieldEditor = ({ field, level, parentId }: JsonSchemaFieldEditorProps) => {
  const { updateField, deleteField, addField, moveField } = useJsonSchemaStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editKey, setEditKey] = useState(field.key);
  const [editType, setEditType] = useState<JsonSchemaType>(field.type);
  const [editRequired, setEditRequired] = useState(field.required);

  const hasNested = 
    (field.type === 'object' && field.nestedFields && field.nestedFields.length > 0) ||
    (field.type === 'array' && Array.isArray(field.arrayItemType));

  const handleSave = () => {
    if (editKey.trim()) {
      updateField(field.id, {
        key: editKey.trim(),
        type: editType,
        required: editRequired,
      });
      setIsEditing(false);
    }
  };

  const handleTypeChange = (newType: JsonSchemaType) => {
    setEditType(newType);
    if (newType === 'object') {
      updateField(field.id, {
        type: newType,
        nestedFields: [],
        arrayItemType: undefined,
      });
    } else if (newType === 'array') {
      updateField(field.id, {
        type: newType,
        arrayItemType: 'string',
        nestedFields: undefined,
      });
    } else {
      updateField(field.id, {
        type: newType,
        nestedFields: undefined,
        arrayItemType: undefined,
      });
    }
  };

  if (isEditing) {
    return (
      <div className={`rounded-lg p-4 ${level > 0 ? 'ml-6' : ''}`} style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', border: '2px solid rgba(6, 182, 212, 0.5)' }}>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Key Name</label>
            <input
              type="text"
              value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={editType}
              onChange={(e) => handleTypeChange(e.target.value as JsonSchemaType)}
              className="input-field"
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="null">Null</option>
              <option value="object">Object</option>
              <option value="array">Array</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required-${field.id}`}
              checked={editRequired}
              onChange={(e) => setEditRequired(e.target.checked)}
              className="rounded"
              style={{ accentColor: '#06b6d4' }}
            />
            <label htmlFor={`required-${field.id}`} className="text-sm text-gray-300">
              Required
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary flex-1">
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditKey(field.key);
                setEditType(field.type);
                setEditRequired(field.required);
              }}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card border-white/10 ${level > 0 ? 'ml-6' : ''}`}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          {hasNested && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-100">{field.key}</span>
              {field.required && (
                <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30">Required</span>
              )}
              <span className="text-sm px-2 py-0.5 bg-electric-500/20 text-electric-400 rounded border border-electric-500/30">
                {field.type}
                {field.type === 'array' && typeof field.arrayItemType === 'string' && (
                  <span className="ml-1 text-teal-300">{`<${field.arrayItemType}>`}</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => moveField(field.id, 'up')}
              className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
              title="Move up"
            >
              <ArrowUp size={16} />
            </button>
            <button
              onClick={() => moveField(field.id, 'down')}
              className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
              title="Move down"
            >
              <ArrowDown size={16} />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-electric-400 transition-colors"
              title="Edit"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => {
                if (confirm(`Delete field "${field.key}"?`)) {
                  deleteField(field.id);
                }
              }}
              className="p-1.5 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Nested content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10">
            {field.type === 'object' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-semibold text-gray-200">Object Properties</span>
                  <button
                    onClick={() => addField(field.id, {
                      key: 'newProperty',
                      type: 'string',
                      required: false,
                    })}
                    className="text-sm btn-secondary py-2 px-4 flex items-center gap-2"
                  >
                    <Plus size={14} />
                    Add Property
                  </button>
                </div>
                <div className="space-y-4">
                  {field.nestedFields?.map((nestedField) => (
                    <JsonSchemaFieldEditor
                      key={nestedField.id}
                      field={nestedField}
                      level={level + 1}
                      parentId={field.id}
                    />
                  ))}
                  {(!field.nestedFields || field.nestedFields.length === 0) && (
                    <p className="text-sm text-gray-400 text-center py-4 bg-white/5 rounded-xl border border-white/10">
                      No properties yet. Click "Add Property" to add one.
                    </p>
                  )}
                </div>
              </div>
            )}

            {field.type === 'array' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Array Item Type
                  </label>
                  <select
                    value={typeof field.arrayItemType === 'string' ? field.arrayItemType : 'object'}
                    onChange={(e) => {
                      const newType = e.target.value;
                      if (newType === 'object') {
                        updateField(field.id, {
                          arrayItemType: [],
                        });
                      } else {
                        updateField(field.id, {
                          arrayItemType: newType as JsonSchemaType,
                        });
                      }
                    }}
                    className="input-field"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="null">Null</option>
                    <option value="object">Object</option>
                  </select>
                </div>

                {Array.isArray(field.arrayItemType) && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-base font-semibold text-gray-200">Object Properties</span>
                      <button
                        onClick={() => {
                          const { addField } = useJsonSchemaStore.getState();
                          addField(field.id, {
                            key: 'newProperty',
                            type: 'string',
                            required: false,
                          });
                        }}
                        className="text-sm btn-secondary py-2 px-4 flex items-center gap-2"
                      >
                        <Plus size={14} />
                        Add Property
                      </button>
                    </div>
                    <div className="space-y-4">
                      {field.arrayItemType.map((itemField) => (
                        <JsonSchemaFieldEditor
                          key={itemField.id}
                          field={itemField}
                          level={level + 1}
                          parentId={field.id}
                        />
                      ))}
                      {field.arrayItemType.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-4 bg-white/5 rounded-xl border border-white/10">
                          No properties yet. Click "Add Property" to add one.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isExpanded && hasNested && (
          <div className="mt-3">
            <button
              onClick={() => setIsExpanded(true)}
              className="text-sm text-electric-400 hover:text-teal-400 font-medium transition-colors"
            >
              {field.type === 'object' && field.nestedFields
                ? `View ${field.nestedFields.length} properties`
                : field.type === 'array' && Array.isArray(field.arrayItemType)
                ? `View ${field.arrayItemType.length} properties`
                : 'Expand to configure'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JsonSchemaFieldEditor;

