import { useState } from 'react';
import { NestedField, DataType, ArrayItemType } from '../types/schema';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { generateId } from '../utils/helpers';

interface NestedFieldEditorProps {
  nestedFields: NestedField[];
  onUpdate: (fields: NestedField[]) => void;
  level?: number;
  availableEntities?: Array<{ id: string; name: string }>;
}

const NestedFieldEditor = ({ 
  nestedFields, 
  onUpdate, 
  level = 0,
  availableEntities = []
}: NestedFieldEditorProps) => {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleExpand = (fieldId: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(fieldId)) {
      newExpanded.delete(fieldId);
    } else {
      newExpanded.add(fieldId);
    }
    setExpandedFields(newExpanded);
  };

  const addField = () => {
    const newField: NestedField = {
      id: generateId(),
      name: 'newField',
      type: 'string',
      required: false,
    };
    onUpdate([...nestedFields, newField]);
  };

  const updateField = (fieldId: string, updates: Partial<NestedField>) => {
    const updated = nestedFields.map((field) => {
      if (field.id === fieldId) {
        const updatedField = { ...field, ...updates };
        // If changing to/from object/array, reset nested structure
        if (updates.type === 'object' && field.type !== 'object') {
          updatedField.nestedFields = [];
          updatedField.arrayItemType = undefined;
        } else if (updates.type === 'array' && field.type !== 'array') {
          updatedField.arrayItemType = { type: 'primitive', value: 'string' };
          updatedField.nestedFields = undefined;
        } else if (updates.type !== 'object' && updates.type !== 'array') {
          updatedField.nestedFields = undefined;
          updatedField.arrayItemType = undefined;
        }
        return updatedField;
      }
      return field;
    });
    onUpdate(updated);
  };

  const deleteField = (fieldId: string) => {
    onUpdate(nestedFields.filter((f) => f.id !== fieldId));
  };

  const updateNestedFields = (fieldId: string, nested: NestedField[]) => {
    const updated = nestedFields.map((field) =>
      field.id === fieldId ? { ...field, nestedFields: nested } : field
    );
    onUpdate(updated);
  };

  const updateArrayItemType = (fieldId: string, itemType: ArrayItemType) => {
    const updated = nestedFields.map((field) =>
      field.id === fieldId ? { ...field, arrayItemType: itemType } : field
    );
    onUpdate(updated);
  };

  return (
    <div className={`space-y-2 ${level > 0 ? 'ml-4 pl-4 border-l-2' : ''}`} style={level > 0 ? { borderColor: 'rgba(255, 255, 255, 0.1)' } : {}}>
      {nestedFields.map((field) => {
        const isExpanded = expandedFields.has(field.id);
        const hasNested = 
          (field.type === 'object' && field.nestedFields && field.nestedFields.length > 0) ||
          (field.type === 'array' && field.arrayItemType);

        return (
          <div key={field.id} className="rounded border p-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex items-center gap-2 mb-2">
              {hasNested && (
                <button
                  onClick={() => toggleExpand(field.id)}
                  className="p-0.5 hover:bg-gray-800/60 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-gray-400" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-400" />
                  )}
                </button>
              )}
              <input
                type="text"
                value={field.name}
                onChange={(e) => updateField(field.id, { name: e.target.value })}
                className="flex-1 input-field text-sm"
                placeholder="Field name"
              />
              <select
                value={field.type}
                onChange={(e) => updateField(field.id, { type: e.target.value as DataType })}
                className="input-field text-sm w-32"
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="date">Date</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
              </select>
              <label className="flex items-center gap-1 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                  className="rounded"
                />
                Required
              </label>
              <button
                onClick={() => deleteField(field.id)}
                className="p-1 hover:bg-red-500/20 rounded text-red-400 hover:text-red-300 transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>

                {/* Object nested fields */}
                {field.type === 'object' && isExpanded && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-300 mb-2">Object Properties:</div>
                <NestedFieldEditor
                  nestedFields={field.nestedFields || []}
                  onUpdate={(fields) => updateNestedFields(field.id, fields)}
                  level={level + 1}
                  availableEntities={availableEntities}
                />
                <button
                  onClick={() => {
                    const current = field.nestedFields || [];
                    const newField: NestedField = {
                      id: generateId(),
                      name: 'property',
                      type: 'string',
                      required: false,
                    };
                    updateNestedFields(field.id, [...current, newField]);
                  }}
                  className="mt-2 text-xs btn-secondary py-1 px-2 flex items-center gap-1"
                >
                  <Plus size={12} />
                  Add Property
                </button>
              </div>
            )}

                {/* Array item type configuration */}
                {field.type === 'array' && isExpanded && (
                  <div className="mt-2">
                    <div className="text-xs font-medium text-gray-300 mb-2">Array Item Type:</div>
                    <ArrayItemTypeEditor
                      itemType={field.arrayItemType || { type: 'primitive', value: 'string' }}
                      onUpdate={(itemType) => updateArrayItemType(field.id, itemType)}
                      level={level + 1}
                      availableEntities={availableEntities}
                    />
                  </div>
                )}

                {/* Auto-expand if has nested content */}
                {hasNested && !isExpanded && (
                  <button
                    onClick={() => toggleExpand(field.id)}
                    className="text-xs text-electric-400 hover:text-teal-400 mt-1 transition-colors"
                  >
                    Click to configure nested structure
                  </button>
                )}
          </div>
        );
      })}

      <button
        onClick={addField}
        className="text-xs btn-secondary py-1 px-2 flex items-center gap-1"
      >
        <Plus size={12} />
        Add Field
      </button>
    </div>
  );
};

interface ArrayItemTypeEditorProps {
  itemType: ArrayItemType;
  onUpdate: (itemType: ArrayItemType) => void;
  level: number;
  availableEntities: Array<{ id: string; name: string }>;
}

const ArrayItemTypeEditor = ({ 
  itemType, 
  onUpdate, 
  level,
  availableEntities 
}: ArrayItemTypeEditorProps) => {
  return (
    <div className={`ml-4 pl-4 border-l-2 space-y-2`} style={{ borderColor: 'rgba(6, 182, 212, 0.3)' }}>
      <select
        value={itemType.type}
        onChange={(e) => {
          const newType = e.target.value;
          if (newType === 'primitive') {
            onUpdate({ type: 'primitive', value: 'string' });
          } else if (newType === 'object') {
            onUpdate({ type: 'object', fields: [] });
          } else if (newType === 'array') {
            onUpdate({ type: 'array', itemType: { type: 'primitive', value: 'string' } });
          } else if (newType === 'entity' && availableEntities.length > 0) {
            onUpdate({ type: 'entity', entityId: availableEntities[0].id });
          }
        }}
        className="input-field text-sm mb-2"
      >
        <option value="primitive">Primitive Type</option>
        <option value="object">Object</option>
        <option value="array">Array (nested)</option>
        {availableEntities.length > 0 && <option value="entity">Entity Reference</option>}
      </select>

      {itemType.type === 'primitive' && (
        <select
          value={itemType.value}
          onChange={(e) => onUpdate({ type: 'primitive', value: e.target.value as DataType })}
          className="input-field text-sm"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="date">Date</option>
        </select>
      )}

      {itemType.type === 'object' && (
        <div>
          <div className="text-xs font-medium text-gray-300 mb-2">Object Properties:</div>
          <NestedFieldEditor
            nestedFields={itemType.fields}
            onUpdate={(fields) => onUpdate({ type: 'object', fields })}
            level={level + 1}
            availableEntities={availableEntities}
          />
        </div>
      )}

      {itemType.type === 'array' && (
        <div>
          <div className="text-xs font-medium text-gray-300 mb-2">Nested Array Item Type:</div>
          <ArrayItemTypeEditor
            itemType={itemType.itemType}
            onUpdate={(nestedItemType) => onUpdate({ type: 'array', itemType: nestedItemType })}
            level={level + 1}
            availableEntities={availableEntities}
          />
        </div>
      )}

      {itemType.type === 'entity' && (
        <select
          value={itemType.entityId}
          onChange={(e) => onUpdate({ type: 'entity', entityId: e.target.value })}
          className="input-field text-sm"
        >
          {availableEntities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {entity.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default NestedFieldEditor;


